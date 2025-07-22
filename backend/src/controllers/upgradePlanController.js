const UpgradePlan = require('../models/Upgrade_plan'); // Đảm bảo đường dẫn đúng đến model của bạn

// Lấy danh sách upgrade plan, filter by frequency (duration), sort by price
exports.getUpgradePlans = async (req, res) => {
    try {
        let { frequency, sort } = req.query;
        let filter = {};
        if (frequency) {
            filter.duration = Number(frequency);
        }
        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        else if (sort === 'desc') sortOption.price = -1;

        const plans = await UpgradePlan.find(filter).sort(sortOption);

        // Xử lý để thêm monthlyPrice và yearlyPrice ĐỘNG vào mỗi plan trước khi gửi về frontend
        const processedPlans = plans.map(planDoc => {
            const planObj = planDoc.toObject(); // Chuyển Mongoose document sang JS object thuần

            if (planObj.isFree) {
                planObj.monthlyPrice = 0;
                planObj.yearlyPrice = 0;
            } else {
                // Logic tính toán giá dựa trên plan.price và plan.duration
                // QUY ƯỚC:
                // - Nếu duration là 12 (năm): plan.price là giá cho 12 tháng.
                //   Giá monthly sẽ được tính bằng (plan.price / 12) * 1.2 (tăng 20% cho mỗi tháng nếu không mua gói năm).
                // - Nếu duration là 1 (tháng): plan.price là giá cho 1 tháng.
                //   Giá yearly sẽ được tính bằng (plan.price * 12) * 0.8 (giảm 20% nếu mua gói năm).

                if (planObj.duration === 12) { // Gói năm
                    planObj.yearlyPrice = planObj.price; // Giá năm là giá đã lưu trong DB
                    planObj.monthlyPrice = Math.ceil(planObj.price / 12 * 1.2); // Tính giá monthly
                } else if (planObj.duration === 1) { // Gói tháng
                    planObj.monthlyPrice = planObj.price; // Giá tháng là giá đã lưu trong DB
                    planObj.yearlyPrice = Math.round(planObj.price * 12 * 0.8); // Tính giá yearly
                } else {
                    // Trường hợp mặc định nếu duration không phải 1 hoặc 12, hoặc để đề phòng
                    // Bạn có thể tùy chỉnh logic này dựa trên các loại duration khác của mình
                    planObj.monthlyPrice = planObj.price;
                    planObj.yearlyPrice = planObj.price; // Hoặc một giá trị mặc định khác
                }
            }
            return planObj;
        });

        res.status(200).json(processedPlans); // Trả về các gói đã được xử lý
    } catch (err) {
        console.error("Lỗi khi lấy danh sách upgrade plan:", err); // Ghi log lỗi chi tiết
        res.status(500).json({ message: 'Lỗi lấy danh sách upgrade plan', error: err.message });
    }
};

// Thêm upgrade plan
exports.createUpgradePlan = async (req, res) => {
    try {
        const {
            code,
            name, // Đảm bảo có nếu đã thêm vào model
            price, // Đây là 'price' gốc bạn nhập từ admin
            description,
            duration, // Thời hạn của gói (1 tháng hoặc 12 tháng)
            contacts,
            isPopular,
            isFree,
            originalPrice,
            // Không nhận monthlyPrice và yearlyPrice từ req.body để lưu vào DB
        } = req.body;

        if (!code || price === undefined || price === null || !duration) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: code, price, duration' });
        }

        let finalPrice = price;
        let finalOriginalPrice = originalPrice;

        // Nếu là gói miễn phí, đặt giá về 0 và xóa originalPrice
        if (isFree) {
            finalPrice = 0;
            finalOriginalPrice = null;
        }

        const plan = new UpgradePlan({
            code,
            name, // Thêm nếu có
            price: finalPrice, // Lưu giá đã xử lý (0 nếu là free)
            description,
            duration,
            contacts,
            isPopular,
            isFree,
            originalPrice: finalOriginalPrice
            // KHÔNG LƯU monthlyPrice và yearlyPrice vào DB
        });

        await plan.save();
        res.status(201).json(plan);
    } catch (err) {
        // Kiểm tra lỗi trùng code nếu bạn muốn rõ ràng hơn
        if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
             return res.status(409).json({ message: `Mã gói '${req.body.code}' đã tồn tại.` });
        }
        console.error("Lỗi tạo upgrade plan:", err); // Ghi log lỗi chi tiết
        res.status(500).json({ message: 'Lỗi tạo upgrade plan', error: err.message });
    }
};

// Sửa upgrade plan
exports.updateUpgradePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            name, // Đảm bảo có nếu đã thêm vào model
            price: inputPrice, // Lấy giá gốc từ req.body
            description,
            duration,
            contacts,
            isPopular,
            isFree,
            originalPrice,
            // Không nhận monthlyPrice và yearlyPrice từ req.body để lưu vào DB
        } = req.body;

        let finalPrice = inputPrice;
        let finalOriginalPrice = originalPrice;

        // Nếu là gói miễn phí, đặt giá về 0 và xóa originalPrice
        if (isFree) {
            finalPrice = 0;
            finalOriginalPrice = null;
        }

        const updates = {
            code,
            name, // Thêm nếu có
            price: finalPrice, // Lưu giá đã xử lý
            description,
            duration,
            contacts,
            isPopular,
            isFree,
            originalPrice: finalOriginalPrice
            // KHÔNG LƯU monthlyPrice và yearlyPrice vào DB
        };

        // Option `runValidators: true` đảm bảo các ràng buộc của schema được áp dụng khi cập nhật
        const plan = await UpgradePlan.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!plan) return res.status(404).json({ message: 'Không tìm thấy upgrade plan' });
        res.status(200).json(plan);
    } catch (err) {
        // Kiểm tra lỗi trùng code nếu bạn muốn rõ ràng hơn khi cập nhật
        if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
             return res.status(409).json({ message: `Mã gói '${req.body.code}' đã tồn tại.` });
        }
        console.error("Lỗi cập nhật upgrade plan:", err); // Ghi log lỗi chi tiết
        res.status(500).json({ message: 'Lỗi cập nhật upgrade plan', error: err.message });
    }
};

// Xóa upgrade plan
exports.deleteUpgradePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await UpgradePlan.findByIdAndDelete(id);
        if (!plan) return res.status(404).json({ message: 'Không tìm thấy upgrade plan' });
        res.status(200).json({ message: 'Đã xóa upgrade plan', plan });
    } catch (err) {
        console.error("Lỗi xóa upgrade plan:", err); // Ghi log lỗi chi tiết
        res.status(500).json({ message: 'Lỗi xóa upgrade plan', error: err.message });
    }
};