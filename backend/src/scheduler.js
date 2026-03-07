const cron = require('node-cron');
const { ServiceDSC, ServiceInsurance } = require('./config/db');
const { Op } = require('sequelize');

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [Scheduler] Running daily expiry check...');
    const today = new Date();

    try {
        // Auto-mark DSC as Expired
        const expiredDSC = await ServiceDSC.update(
            { status: 'Expired', follow_up_status: 'Pending' },
            {
                where: {
                    expiry_date: { [Op.lt]: today },
                    status: { [Op.notIn]: ['Expired', 'Renewed'] }
                }
            }
        );

        // Auto-mark Insurance as Expired
        const expiredIns = await ServiceInsurance.update(
            { status: 'Expired', follow_up_status: 'Pending' },
            {
                where: {
                    expiry_date: { [Op.lt]: today },
                    status: { [Op.notIn]: ['Expired', 'Renewed', 'Cancelled'] }
                }
            }
        );

        console.log(`✅ [Scheduler] Marked ${expiredDSC[0]} DSC + ${expiredIns[0]} Insurance as Expired.`);
    } catch (err) {
        console.error('❌ [Scheduler] Error:', err.message);
    }
});

console.log('⏰ Daily expiry scheduler started (runs at 8:00 AM).');
