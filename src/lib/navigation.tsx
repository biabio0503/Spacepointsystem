'use client';

import { useRouter as useNextRouter, usePathname as useNextPathname, useParams as useNextParams } from 'next/navigation';

/**
 * React Router의 useNavigate를 Next.js의 useRouter로 대체하는 wrapper hook
 */
export function useNavigate() {
   const router = useNextRouter();

   const navigate = (path: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
         router.replace(path);
      } else {
         router.push(path);
      }
   };

   return navigate;
}

/**
 * React Router의 useLocation을 Next.js의 usePathname으로 대체하는 wrapper hook
 */
export function useLocation() {
   const pathname = useNextPathname();
   return {
      pathname: pathname || '/',
      search: '',
      hash: '',
      state: null,
   };
}

/**
 * React Router의 useParams를 Next.js의 useParams로 대체하는 wrapper hook
 */
export function useParams() {
   return useNextParams() || {};
}

/**
 * React Router의 Outlet을 Next.js의 children으로 대체하는 wrapper component
 */
export function Outlet({ children }: { children?: React.ReactNode }) {
   return <>{children}</>;
}
