const mongoose = require('mongoose');
const User = require('../src/models/users');
const Role = require('../src/models/Roles');
const dotenv = require('dotenv');

dotenv.config();

const updateUserRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the customer role
        const customerRole = await Role.findOne({ role_name: 'customer' });
        if (!customerRole) {
            console.error('Customer role not found');
            return;
        }

        // Update all users that don't have a role or have the old 'user' role
        const result = await User.updateMany(
            { 
                $or: [
                    { role_id: { $exists: false } },
                    { 'role_id.role_name': 'user' }
                ]
            },
            { $set: { role_id: customerRole._id } }
        );

        console.log(`Updated ${result.modifiedCount} users to customer role`);

    } catch (error) {
        console.error('Error updating user roles:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the update function if this file is executed directly
if (require.main === module) {
    updateUserRoles();
}

module.exports = updateUserRoles; 