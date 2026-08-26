const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`SELECT NOW() AS current_time`;

    res.status(200).json({
      success: true,
      message: 'Neon DB connection successful',
      time: result[0].current_time
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Neon DB connection failed',
      error: error.message
    });
  }
};