import React from 'react';
import events from './events';
import { Route, useRouteMatch, useLocation } from 'react-router-dom';
import { modules } from 'stripes-config';
import { getEventHandler } from './handlerService'

const getPublicRoutes = (stripes, data) => {
  
  const handlerMods = modules.handler;
  
  // Grab the hadnler data like normal.
  return handlerMods.reduce((acc, mod) => {
    
    // Don't allow modules that don't declare a route to add public routes.
    const baseRoute = mod.route;
    if (baseRoute) {
    
      // Grab the handler results for the event.
      const propsObject = getEventHandler(events.ADD_PUBLIC_ROUTE, stripes, mod, data);
      if (propsObject) {
        
        // Strip properties we want to interract with directly or ignore.
        const {key: _originalKey, path, ...componentProps} = propsObject;
        
        // Clean the paths.
        let pathArray = path;
        if (!Array.isArray(pathArray)) {
          pathArray = [path];
        }
        
        const pathArrayPrefixed = pathArray.map(entry => (`${baseRoute}${entry}`));
        
        // Add a route but prefix the path. Then create a sub route without the prefix.
        // This enables us to delegate to the matching capabilites of the router and keep implementors
        // less aware of the the prefixing etc.
        acc.push(<Route path={pathArrayPrefixed} key={`${pathArrayPrefixed.join('-')}`} component={() => {
          
          // Current match and path.
          const location = useLocation();
          const {path} = useRouteMatch();
          
          // When this route matches pass in a copy of the location with the prefix removed.
          // Should make for cleaner code in implementors.
          const subLocation = Object.assign({}, location, { pathname: path.substring(baseRoute.length) });
          
          return <Route path={pathArray} stripes={stripes} { ...componentProps } location={subLocation} />;
        }} />);
      }
    }
    return acc;
  }, []);
};

export default getPublicRoutes;
