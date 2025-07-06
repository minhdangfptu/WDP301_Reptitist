const mongoose = require('mongoose');
const User = require('../src/models/users');
const Role = require('../src/models/Roles');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find admin role
        const adminRole = await Role.findOne({ role_name: 'admin' });
        if (!adminRole) {
            console.log('Admin role not found. Creating...');
            const newAdminRole = new Role({
                role_name: 'admin',
                role_description: 'Administrator role',
                role_active: true
            });
            await newAdminRole.save();
            console.log('Admin role created');
        }

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            email: 'admin@reptitist.com',
            password_hashed: hashedPassword,
            role_id: adminRole._id,
            fullname: 'Administrator',
            isActive: true,
            account_type: {
                type: 4, // Highest level
                activated_at: new Date()
            }
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Email: admin@reptitist.com');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the function if this file is executed directly
if (require.main === module) {
    createAdminUser();
}

module.exports = createAdminUser; 