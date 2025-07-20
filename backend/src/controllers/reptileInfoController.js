const Reptile = require('../models/Reptiles');

const createReptile = async (req, res) => {
    try {
        const {
            specific_name,
            common_name,
            reptile_category,
            breed_or_morph,
            lifespan_years,
            adult_size,
            natural_habitat,
            activity_pattern,
            temperature_range,
            humidity_range_percent,
            uvb_required,
            reptile_description,
            diet,
            recommended_foods,
            prohibited_foods,
            disease
        } = req.body;

        if (!specific_name) return res.status(400).json({ message: 'Missing specific_name' });
        if (!common_name) return res.status(400).json({ message: 'Missing common_name' });

        if (!reptile_category || !reptile_category.class || !reptile_category.order || !reptile_category.family) {
            return res.status(400).json({ message: 'Missing reptile_category or its fields' });
        }

        if (lifespan_years === undefined) return res.status(400).json({ message: 'Missing lifespan_years' });

        if (!adult_size || adult_size.min === undefined || adult_size.max === undefined) {
            return res.status(400).json({ message: 'Missing adult_size or min/max' });
        }

        if (
            !temperature_range ||
            !Array.isArray(temperature_range.day) ||
            !Array.isArray(temperature_range.night)
        ) {
            return res.status(400).json({ message: 'Missing or invalid temperature_range' });
        }

        if (!humidity_range_percent || !Array.isArray(humidity_range_percent)) {
            return res.status(400).json({ message: 'Missing or invalid humidity_range_percent' });
        }

        if (uvb_required === undefined) return res.status(400).json({ message: 'Missing uvb_required' });

        if (
            !disease ||
            !disease.day ||
            !disease.prevention ||
            !disease.treatment
        ) {
            return res.status(400).json({ message: 'Missing disease or its fields' });
        }

        const reptile = new Reptile({
            specific_name,
            common_name,
            reptile_category,
            breed_or_morph,
            lifespan_years,
            adult_size,
            natural_habitat,
            activity_pattern,
            temperature_range,
            humidity_range_percent,
            uvb_required,
            reptile_description,
            diet,
            recommended_foods,
            prohibited_foods,
            disease
        });

        await reptile.save();

        res.status(201).json({ message: 'Reptile created successfully!', reptile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create reptile', error: error.message });
    }
};
const insertManyReptiles = async (req, res) => {
    try {
        const reptilesData = req.body; 

        if (!Array.isArray(reptilesData) || reptilesData.length === 0) {
            return res.status(400).json({ message: 'Request body must be a non-empty array' });
        }

        const insertedReptiles = await Reptile.insertMany(reptilesData, { ordered: false });

        res.status(201).json({
            message: `Inserted ${insertedReptiles.length} reptiles successfully!`,
            reptiles: insertedReptiles
        });
    } catch (error) {
        console.error('Error inserting reptiles:', error);
        res.status(500).json({ message: 'Failed to insert reptiles', error: error.message });
    }
};

module.exports = { createReptile, insertManyReptiles };