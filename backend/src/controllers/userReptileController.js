const UserReptile = require('../models/User_reptiles');
const mongoose = require('mongoose');

const createUserReptile = async (req, res) => {
    try {
        const {
            user_id,
            reptile_name,
            reptile_species,
            name,
            description,
            user_reptile_imageurl,
            age,
            follow_since,
            current_weight,
            weight_history,
            sleeping_status,
            sleeping_history,
            treatment_history,
            nutrition_history
        } = req.body;

        if (!user_id || !reptile_name || !reptile_species) {
            return res.status(400).json({
                message: 'Missing required fields: user_id, reptile_name, or reptile_species'
            });
        }

        const newUserReptile = new UserReptile({
            user_id,
            reptile_name,
            reptile_species,
            name,
            description,
            user_reptile_imageurl: user_reptile_imageurl || '',
            age,
            follow_since,
            current_weight,
            weight_history: weight_history || [],
            sleeping_status: sleeping_status || [],
            sleeping_history: sleeping_history || [],
            treatment_history: treatment_history || [],
            nutrition_history: nutrition_history || []
        });

        await newUserReptile.save();
        res.status(201).json({ message: 'User reptile created successfully!', userReptile: newUserReptile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user reptile!', error: error.message });
    }
};

// Lấy tất cả bò sát theo user_id
const getAllUserReptilesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching reptiles for user:', userId);
        const reptiles = await UserReptile.find({ user_id: userId });
        if (!reptiles.length) {
            return res.status(404).json({ message: 'No reptiles found for this user' });
        }
        res.status(200).json(reptiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch reptiles!', error: error.message });
    }
};

// Tìm bò sát theo tên (field name)
const getUserReptilesByName = async (req, res) => {
    try {
        const { reptileName } = req.params;
        const reptiles = await UserReptile.find({ name: { $regex: reptileName, $options: 'i' } });
        if (!reptiles.length) {
            return res.status(404).json({ message: 'No reptiles found with this name' });
        }
        res.status(200).json(reptiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch reptiles!', error: error.message });
    }
};

// Lấy 10 bò sát mới tạo gần đây
const getRecentUserReptiles = async (req, res) => {
    try {
        const reptiles = await UserReptile.find().sort({ createdAt: -1 }).limit(10);
        if (!reptiles.length) {
            return res.status(404).json({ message: 'No recent reptiles found' });
        }
        res.status(200).json(reptiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch recent reptiles!', error: error.message });
    }
};



// Xóa bò sát theo _id
const deleteUserReptile = async (req, res) => {
    try {
        const { reptileId } = req.params;
        const reptile = await UserReptile.findByIdAndDelete(reptileId);
        if (!reptile) {
            return res.status(404).json({ message: 'Reptile not found' });
        }
        res.status(200).json({ message: 'Reptile deleted successfully!', deletedReptile: reptile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete reptile!', error: error.message });
    }
};
// Lấy chi tiết bò sát theo _id
async function findReptileById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid reptile ID');
    }
    const reptile = await UserReptile.findById(id);
    if (!reptile) throw new Error('Reptile not found');
    return reptile;
}
const getReptileById = async (req, res) => {
    try {
        const reptile = await findReptileById(req.params.reptileId);
        res.status(200).json(reptile);
    } catch (error) {
        const msg = error.message;
        if (msg === 'Invalid reptile ID') return res.status(400).json({ message: msg });
        if (msg === 'Reptile not found') return res.status(404).json({ message: msg });
        res.status(500).json({ message: 'Failed to fetch reptile', error: msg });
    }
};


// Cập nhật bò sát theo _id
const updateUserReptile = async (req, res) => {
    try {
        const { reptileId } = req.params;
        const updatedData = req.body;

        const reptile = await UserReptile.findByIdAndUpdate(reptileId, updatedData, { new: true });
        if (!reptile) {
            return res.status(404).json({ message: 'Reptile not found' });
        }
        res.status(200).json({ message: 'Reptile updated successfully!', reptile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update reptile!', error: error.message });
    }
};
const createTreatmentHistory = async (req, res) => {
    const { reptileId } = req.params;
    const { treatment_records } = req.body;

    try {
        // Kiểm tra xem treatment_records có phải là mảng không
        if (!Array.isArray(treatment_records)) {
            return res.status(400).json({
                message: 'Invalid data format. Expected an array of treatment records.'
            });
        }

        // Kiểm tra các trường bắt buộc cho mỗi bản ghi
        for (const record of treatment_records) {
            if (!record.disease || !record.treatment_date || !record.treatment_medicine) {
                return res.status(400).json({
                    message: 'Missing required fields in one or more records: disease, treatment_date, or treatment_medicine'
                });
            }
        }

        const updatedReptile = await UserReptile.findByIdAndUpdate(
            reptileId,
            {
                $push: {
                    treatment_history: { $each: treatment_records }
                }
            },
            { new: true }
        );

        if (!updatedReptile) {
            return res.status(404).json({ message: 'Reptile not found' });
        }

        return res.status(200).json({
            message: 'Treatment history updated successfully',
            data: updatedReptile
        });
    } catch (error) {
        console.error('Error updating treatment history:', error.message);
        return res.status(500).json({
            message: 'Failed to update treatment history',
            error: error.message
        });
    }
};



  


const createHealthHistory = async (req, res) => {
    const { reptileId } = req.params;  
    const {
        current_weight,
        weight_history,
        sleeping_status,
        sleeping_history,
        treatment_history,
        nutrition_history
    } = req.body;

    try {
        
        const updatedReptile = await UserReptile.findByIdAndUpdate(
            reptileId,  // Tìm bò sát theo ID
            {
                $push: {
                    weight_history: { $each: weight_history },  
                    sleeping_status: { $each: sleeping_status },  
                    sleeping_history: { $each: sleeping_history },  
                    treatment_history: { $each: treatment_history },
                    nutrition_history: { $each: nutrition_history }  
                },
                $set: { current_weight } 
            },
            { new: true }  
        );

        if (!updatedReptile) {
            return res.status(404).json({ message: 'Reptile not found' });
        }

        // Trả về dữ liệu đã cập nhật
        return res.status(200).json({
            message: 'Reptile data updated successfully',
            data: updatedReptile
        });
    } catch (error) {
        console.error('Error updating reptile data:', error.message);
        return res.status(500).json({
            message: 'Failed to update reptile data',
            error: error.message
        });
    }
}

module.exports = {
    createUserReptile,
    getAllUserReptilesByUser,
    getUserReptilesByName,
    getRecentUserReptiles,
    getReptileById,
    deleteUserReptile,
    updateUserReptile,
    findReptileById,
    createTreatmentHistory,
    createHealthHistory
};