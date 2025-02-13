import type { Router } from 'vue-router';
import { defineStore } from 'pinia';
import { routes as staticRoutes } from '@/router';
import { fetchUserRoutes } from '@/service';
import {
  getUserInfo,
  transformAuthRouteToMenu,
  transformAuthRoutesToVueRoutes,
  transformAuthRoutesToSearchMenus,
  getCacheRoutes
} from '@/utils';
import { useTabStore } from '../tab';

interface RouteState {
  /**
   * 权限路由模式:
   * - static - 前端声明的静态
   * - dynamic - 后端返回的动态
   */
  authRouteMode: ImportMetaEnv['VITE_AUTH_ROUTE_MODE'];
  /** 是否初始化了权限路由 */
  isInitedAuthRoute: boolean;
  /** 路由首页name(前端静态路由时生效，后端动态路由该值会被后端返回的值覆盖) */
  routeHomeName: AuthRoute.RouteKey;
  /** 菜单 */
  menus: GlobalMenuOption[];
  /** 搜索的菜单 */
  searchMenus: AuthRoute.Route[];
  /** 缓存的路由名称 */
  cacheRoutes: string[];
}

export const useRouteStore = defineStore('route-store', {
  state: (): RouteState => ({
    authRouteMode: import.meta.env.VITE_AUTH_ROUTE_MODE,
    isInitedAuthRoute: false,
    routeHomeName: 'dashboard_analysis',
    menus: [],
    searchMenus: [],
    cacheRoutes: []
  }),
  actions: {
    /**
     * 处理权限路由
     * @param routes - 权限路由
     * @param router - 路由实例
     */
    handleAuthRoutes(routes: AuthRoute.Route[], router: Router) {
      this.menus = transformAuthRouteToMenu(routes);
      this.searchMenus = transformAuthRoutesToSearchMenus(routes);

      const vueRoutes = transformAuthRoutesToVueRoutes(routes);
      vueRoutes.forEach(route => {
        router.addRoute(route);
      });

      this.cacheRoutes = getCacheRoutes(vueRoutes);
    },
    /**
     * 初始化动态路由
     * @param router - 路由实例
     */
    async initDynamicRoute(router: Router) {
      const { userId } = getUserInfo();
      const { data } = await fetchUserRoutes(userId);
      if (data) {
        this.routeHomeName = data.home;
        this.handleAuthRoutes(data.routes, router);
      }
    },
    /**
     * 初始化静态路由
     * @param router - 路由实例
     */
    async initStaticRoute(router: Router) {
      // 先根据用户权限过滤一下staticRoutes

      this.handleAuthRoutes(staticRoutes, router);
    },
    /**
     * 初始化权限路由
     * @param router - 路由实例
     */
    async initAuthRoute(router: Router) {
      const { initHomeTab } = useTabStore();
      const { userId } = getUserInfo();
      if (!userId) return;

      const isDynamicRoute = this.authRouteMode === 'dynamic';
      if (isDynamicRoute) {
        await this.initDynamicRoute(router);
      } else {
        await this.initStaticRoute(router);
      }

      initHomeTab(this.routeHomeName, router);
      this.isInitedAuthRoute = true;
    }
  }
});
