import { Subject } from "rxjs";
import { NAVIGATION_MODE } from "../shared/constants";

function RollCakeRouter(props) {
    const { routes, mode } = props;

    this.routes = routes;
    this.mode = mode;

    //methods to be defined based on navigation mode
    this.currentPath = () => {};
    this.navigateTo = () => {};

    switch(this.mode) {
        case NAVIGATION_MODE.HISTORY:
            this.currentPath = () => {
                const path = window.location.pathname;
                return path ? path : '/';
            };
            this.navigateTo = (path) => {
                window.history.pushState(
                    {},
                    path,
                    window.location.origin + path
                );
            };
            history.pushState = ( f => function pushState(){
                const ret = f.apply(this, arguments);
                window.dispatchEvent(new Event('locationchange'));
                return ret;
            })(history.pushState);
            history.replaceState = ( f => function replaceState(){
                const ret = f.apply(this, arguments);
                window.dispatchEvent(new Event('locationchange'));
                return ret;
            })(history.replaceState);
            break;
        case NAVIGATION_MODE.HASH:
        default:
            this.currentPath = () => {
                const path = location.hash.slice(1).toLowerCase();
                return path ? path : '/';
            };
            this.navigateTo = (path) => {
                window.location.hash = path;
            };
            break;
    }

    //strictily interal
    this._routeParameters = new Subject();
}

RollCakeRouter.prototype._matchRoute = function() {
    const route = this.routes.find(r => r.path === this.currentPath());
    if (route && route.item) {
        this._routeParameters.next({ item: route.item, path: route.path });
    } else {
        this._routeParameters.next(null);
    }
}

RollCakeRouter.prototype.init = function(callback) {
    window.addEventListener('load', () => {
        this._matchRoute();
    });
    switch(this.mode)
    {
        case NAVIGATION_MODE.HISTORY:
            window.addEventListener('locationchange', () => {
                this._matchRoute();
            });
            window.addEventListener('popstate', () => {
                this._matchRoute();
            });
            break;
        case NAVIGATION_MODE.HASH:
        default:
            window.addEventListener('hashchange', () => {
                this._matchRoute();
            });
            break;
    }
    
    this._routeParameters.subscribe((response) => callback(response));
};

export default RollCakeRouter;