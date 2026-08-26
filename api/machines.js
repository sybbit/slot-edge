const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const machines = await sql`
        SELECT
          id,
          machine_name,
          manufacturer,
          machine_type,
          created_at
        FROM machines
        ORDER BY id
      `;

      return res.status(200).json({
        success: true,
        machines
      });
    }

    if (req.method === 'POST') {
      const { machine_name, manufacturer, machine_type } = req.body;

      if (!machine_name) {
        return res.status(400).json({
          success: false,
          message: 'machine_name is required'
        });
      }

      const result = await sql`
        INSERT INTO machines (
          machine_name,
          manufacturer,
          machine_type
        )
        VALUES (
          ${machine_name},
          ${manufacturer || null},
          ${machine_type || null}
        )
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        machine: result[0]
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: error.message
    });
  }
};