

import mongoose from 'mongoose';

const dailyTaskTemplateSchema = mongoose.Schema({
    description: { type: String, required: true },
    xpReward: { type: Number, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'onetime', 'milestone'], required: true }, 
    criteria: { type: String, required: true, unique: true }, 
    active: { type: Boolean, default: true }, 
    maxCompletions: { type: Number, default: 1 }, 
    timeframe: { type: String, enum: ['daily', 'weekly', 'onetime'], default: 'daily' }, 

    externalLink: { type: String }, 

}, { timestamps: true });

export default mongoose.model("DailyTaskTemplate", dailyTaskTemplateSchema);