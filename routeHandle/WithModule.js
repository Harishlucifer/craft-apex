import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {match} from 'path-to-regexp';
import axios from "axios";

const withModule = (WrappedComponent) => {
    // console.log("with module :: 1")
    const WithModule = (props) => {
        // console.log("with module rendering");
        const location = useLocation();
        const [module, setModule] = useState(null);
        const [globalModule, setGlobalModule] = useState([])

        useEffect(() => {
            let data = JSON.parse(localStorage.getItem("module") ?? null);
            setGlobalModule(data);
        }, [])

        useEffect(() => {
            const moduleData = getModuleData(location.pathname, globalModule);
            console.log("moduleData :: ", moduleData)
            setModule(moduleData);
            moduleData && (axios.defaults.headers.common["X-Module"] = moduleData ? moduleData?.map_id : "")
        }, [location, globalModule]);

        return <WrappedComponent {...props} module={module}/>;
    };

    // Set a display name for easier debugging
    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    WithModule.displayName = `WithModule(${wrappedComponentName})`;

    return WithModule;
};

// Function to map paths to module data
const getModuleData = (pathname, moduleMapping) => {
    console.log("moduleMapping :: ", moduleMapping)
    try{
        for (let module of moduleMapping) {
            // Check child modules first
            if (module.child_module) {
                for (let childModule of module.child_module) {
                    if(childModule.child_module){
                        for(let innerChildModule of childModule.child_module){
                            if(innerChildModule.url){
                                const moduleUrl = innerChildModule?.url.split('?')[0];
                                const matchInnerChildRoute = match(moduleUrl, {decode:decodeURIComponent})
                                const innerChildResult = matchInnerChildRoute(pathname)

                                if(innerChildResult){
                                    return innerChildModule
                                }
                            }
                        }
                    }
                    if (childModule.url) {
                        const moduleUrl = childModule?.url.split('?')[0];
                        const matchChildRoute = match(moduleUrl, { decode: decodeURIComponent });
                        const childResult = matchChildRoute(pathname);

                        if (childResult) {
                            // Return only the matching child module
                            return childModule;
                        }
                    }
                }
            }

            // Then check the main module
            if (module.url) {
                const moduleUrl = module?.url.split('?')[0];
                const matchRoute = match(moduleUrl, { decode: decodeURIComponent });
                const result = matchRoute(pathname);

                if (result) {
                    return module;
                }
            }
        }
    }catch (e) {
        console.log('error module',e)
    }


    return null;
}

export default withModule;
