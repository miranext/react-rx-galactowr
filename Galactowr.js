
import Rx from 'rx';

const { range,  interval, zip, fromEvent, merge, combineLatest } = Rx.Observable;

import { renderEntities } from './utils';

const { assign } = Object;
const { random } = Math;

const WIDTH = 520;
const HEIGHT = 620;
const MAX_STAR_VELOCITY = 0.8;
const FLAP_INTERVAL = 34;

const randomizeStars = (count) => {
    const stars = [];

    const starsType = ['star-small', 'star-medium', 'star-small2', 'star-small3'];

    range(0, count).subscribe ( num => {
        const type = starsType[parseInt(random() * 4)];
        const velocity = MAX_STAR_VELOCITY * random();
        stars.push(
            {
                key: type+"-"+num,
                vy: velocity ? velocity : MAX_STAR_VELOCITY,
                x: random() * WIDTH,
                y: random() * HEIGHT,
                id: type
            }
        );

    });
    return stars;
};

const createShipMissile = (ship) => {
    return { shipMissile: true, id: 'missile', x: ship.x + (15/2) - 1.2, y: ship.y, vy: 10 }
};

const createEnemies = ( ) => {
    const masters = [];

    range(0, 4).subscribe ( num => {
        masters.push({ key: 'e1' +  num, x: 200 + (num * 20), y: 40, id: 'e11' });
    });

    const midLevels = [];

    range(0, 16).subscribe ( num => {
        var y = 60;
        if ( num > 7 ) {
            y = 80;
        }
        const multiplier = num <= 7 ? num : num - 8;
        midLevels.push({ key: 'e2' +  num, x: 160 + ( multiplier * 20), y, id: 'e21' });
    });


    const lowerLevels= [];

    range(0, 20).subscribe ( num => {
        var y = 100;
        if ( num > 9 ) {
            y = 120;
        }
        const multiplier = num <= 9 ? num : num - 10;
        lowerLevels.push({ key: 'e3' +  num, x: 140 + (multiplier * 20), y, id: 'e31' });
    });

    return [ ...masters, ...midLevels, ...lowerLevels ];
}

const flapEnemy1 = (id) => {
    if ( id === 'e11' ) {
        return 'e12';
    } else if ( id === 'e21' ) {
        return 'e22';
    } else if ( id === 'e31' ) {
        return 'e32';
    }
    return id;
}
const flapEnemy2 = (id) => {
    if ( id === 'e12' ) {
        return 'e11';
    } else if ( id === 'e22' ) {
        return 'e21';
    } else if ( id === 'e32' ) {
        return 'e31';
    }
    return id;
}

/**
 * Galaga like game in react and rxj
 *
 * $ = stream
 */
export const createGame = (node) => {

    const ship = { id: 'ship', x: WIDTH/2, y: 600, vx: 5, vy: 0 };
    const stars = randomizeStars(200);
    const missileArr = [];

    const tick$ = interval(33);

    const keyInput$ = merge(fromEvent(window, 'keyup'), fromEvent(window, 'keydown'));

    const enemies = createEnemies();

    const ship$ = merge( tick$, keyInput$ ).scan( (tick, keyInput) => {
        if (  keyInput && keyInput.code === 'ArrowRight' ) {
            return assign(ship, { x: ship.x + ship.vx });
        } else if (  keyInput && keyInput.code === 'ArrowLeft' ) {
            return assign(ship, { x: ship.x - ship.vx });
        } else if ( keyInput && keyInput.code === 'Space' && missileArr.length === 0) {
            new Audio("fire.mp3").play();
            missileArr.push(createShipMissile(ship));
        }

        return ship;
    }, ship);

    const star$ = tick$.map( (interval) => {
        return stars.map( star => {
            const xy = { x: star.x, y: star.y + star.vy };
            if ( xy.y > HEIGHT ) {
                return assign( star, xy, { y: 0, x: random() * WIDTH, vy: MAX_STAR_VELOCITY * random() } );
            } else {
                return assign( star, xy );
            }
        });
    });

    const missile$ = tick$.map( () => {
        if ( missileArr.length > 0 ) {
            const m = missileArr[0];
            if ( m.y > 0 ) {
                assign(m, {y: m.y - m.vy})
            } else {
                missileArr.splice(0);
            }
            return m;
        }
        return ;
    });

    const enemies$ = tick$.map( (interval) => {
        return enemies.map( e => {
            const flapEnemySprite = interval % FLAP_INTERVAL;
            if ( flapEnemySprite > FLAP_INTERVAL/2 ) {
                e.id = flapEnemy1(e.id);
            } else {
                e.id = flapEnemy2(e.id);
            }
            return e;
        });
    });

    zip(ship$,star$,missile$,enemies$, (shipNow, starArr, missile, enemies) => {
        const mssArr = missile ? [missile] : []; //we need to do this because missle can be undefined

        return [ shipNow, ...starArr, ...mssArr, ...enemies ];
    }).subscribe( (entities) => {

        renderEntities(entities, node);
    });
};
