(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__443076bd._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/investment-platform-design/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$investment$2d$platform$2d$design$2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_$40$auth$2b$core$40$0$2e$34$2e$3_nodemailer$40$7$2e$0$2e$11_$5f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_rea_eab0d05f810858c3c4d8b57341aa1a00$2f$node_modules$2f$next$2d$auth$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/investment-platform-design/node_modules/.pnpm/next-auth@4.24.13_@auth+core@0.34.3_nodemailer@7.0.11__next@16.0.3_react-dom@19.2.0_rea_eab0d05f810858c3c4d8b57341aa1a00/node_modules/next-auth/middleware.js [middleware-edge] (ecmascript)");
;
const middleware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$investment$2d$platform$2d$design$2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_$40$auth$2b$core$40$0$2e$34$2e$3_nodemailer$40$7$2e$0$2e$11_$5f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_rea_eab0d05f810858c3c4d8b57341aa1a00$2f$node_modules$2f$next$2d$auth$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withAuth"])(function middleware(request) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;
    // Role-based route protection
    if (pathname.startsWith("/admin")) {
        if (token?.role !== "admin") {
            return Response.redirect(new URL("/dashboard", request.url));
        }
    }
    if (pathname.startsWith("/owner")) {
        if (token?.role !== "business_owner") {
            return Response.redirect(new URL("/dashboard", request.url));
        }
    }
    if (pathname.startsWith("/investor")) {
        if (token?.role !== "investor") {
            return Response.redirect(new URL("/dashboard", request.url));
        }
    }
    return undefined;
}, {
    callbacks: {
        authorized: ({ token, req })=>{
            // Routes that require authentication
            const protectedRoutes = [
                "/admin",
                "/owner",
                "/investor",
                "/dashboard"
            ];
            const isProtectedRoute = protectedRoutes.some((route)=>req.nextUrl.pathname.startsWith(route));
            if (isProtectedRoute) {
                return !!token;
            }
            return true;
        }
    }
});
const config = {
    matcher: [
        "/admin/:path*",
        "/owner/:path*",
        "/investor/:path*",
        "/dashboard/:path*",
        "/api/admin/:path*",
        "/api/owner/:path*",
        "/api/investor/:path*"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__443076bd._.js.map