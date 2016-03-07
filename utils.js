

import React from 'react';
import { render } from 'react-dom';

const createEntity = (entityDesc) => {
    return <div style={{ position: 'absolute', left: entityDesc.x, top: entityDesc.y}}
        key={entityDesc.key || entityDesc.id} className={entityDesc.id}></div>;
};


export const renderEntities = (entities, node) => {
    const reactEl = <div style={{ position: 'relative'}}>
            {entities.map( ex => {
                return createEntity(ex);
            })}
    </div>;
    render( reactEl, node);
};
