const upiPriceTiers = [300, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 5000];

// Placeholder VPA (Virtual Payment Address)
const VPA = "syllabiq@placeholder.upi";

const generateUpiLinks = () => {
    const links: { [key: string]: { base: string; discounted: string } } = {};
    upiPriceTiers.forEach(price => {
        const baseAmount = price.toFixed(2);
        // Applying a fixed 30% discount for the discounted link placeholder
        const discountedAmount = (price * 0.7).toFixed(2);

        links[String(price)] = {
            base: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=${baseAmount}&cu=INR&tn=CoursePurchase`,
            discounted: `upi://pay?pa=${VPA}&pn=SyllabiQ&am=${discountedAmount}&cu=INR&tn=CoursePurchasePromo`
        };
    });
    return links;
};

export const upiLinks = generateUpiLinks();

export const allowedPromoCodes = ['LAUNCH-2026', 'SAVE-20', 'BUY-NOW', 'COURSE-4U'];
