
export const validPromoCodes = ['LAUNCH-2026', 'SAVE-20', 'BUY-NOW', 'COURSE-4U'];

const VPA = "9347229296@ibl";

const upiLinks: { [key: string]: { base: string; discounted: string } } = {
    "300": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=300.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=240.00&cu=INR&tn=CoursePurchasePromo`
    },
    "500": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=500.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=400.00&cu=INR&tn=CoursePurchasePromo`
    },
    "750": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=750.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=600.00&cu=INR&tn=CoursePurchasePromo`
    },
    "1000": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=1000.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=800.00&cu=INR&tn=CoursePurchasePromo`
    },
    "1250": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=1250.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=1000.00&cu=INR&tn=CoursePurchasePromo`
    },
    "1500": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=1500.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=1200.00&cu=INR&tn=CoursePurchasePromo`
    },
    "2000": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=2000.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=1600.00&cu=INR&tn=CoursePurchasePromo`
    },
    "2500": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=2500.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=2000.00&cu=INR&tn=CoursePurchasePromo`
    },
    "3000": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=3000.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=2400.00&cu=INR&tn=CoursePurchasePromo`
    },
    "5000": {
        base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=5000.00&cu=INR&tn=CoursePurchase`,
        discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=4000.00&cu=INR&tn=CoursePurchasePromo`
    },
};

export { upiLinks };
