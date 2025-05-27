// Create this file as: backend/scripts/seedRoles.js
const mongoose = require('mongoose');
const Role = require('../src/models/Roles');
const dotenv = require('dotenv');

dotenv.config();

const seedRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if roles already exist
        const existingRoles = await Role.find();
        if (existingRoles.length > 0) {
            console.log('Roles already exist:', existingRoles.map(r => r.role_name));
            return;
        }

        // Create default roles
        const defaultRoles = [
            {
                role_name: 'customer',
                role_description: 'Default customer role',
                role_active: true
            },
            {
                role_name: 'admin',
                role_description: 'Administrator role',
                role_active: true
            },
            {
                role_name: 'shop',
                role_description: 'Shop owner role',
                role_active: true
            }
        ];

        const createdRoles = await Role.insertMany(defaultRoles);
        console.log('Default roles created:', createdRoles.map(r => r.role_name));

    } catch (error) {
        console.error('Error seeding roles:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
    seedRoles();
}

module.exports = seedRoles;