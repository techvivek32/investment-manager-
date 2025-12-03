module.exports = [
"[project]/lib/models/Business.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Business",
    ()=>Business
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const businessSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    ownerId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: null
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: [
            "pending",
            "under_review",
            "verified",
            "approved",
            "rejected"
        ],
        default: "pending",
        required: true
    },
    minInvestmentAmount: {
        type: Number,
        required: true,
        min: 0
    },
    maxInvestmentAmount: {
        type: Number,
        required: true,
        min: 0
    },
    expectedReturnPercentage: {
        type: Number,
        default: null
    },
    documents: {
        type: [
            __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId
        ],
        ref: "Document",
        default: []
    },
    monthlyRevenue: {
        type: Number,
        default: null
    },
    profitMargin: {
        type: Number,
        default: null
    },
    growthPercentage: {
        type: Number,
        default: null
    },
    customerCount: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});
// Indexes for performance
businessSchema.index({
    ownerId: 1
});
businessSchema.index({
    status: 1
});
businessSchema.index({
    createdAt: -1
});
const Business = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Business || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("Business", businessSchema);
}),
];

//# sourceMappingURL=lib_models_Business_ts_3c47e40a._.js.map