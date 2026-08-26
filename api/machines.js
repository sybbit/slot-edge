const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    const rows = await sql`
      SELECT
        m.id AS machine_id,
        m.machine_key,
        m.machine_name,
        m.manufacturer,
        m.machine_type,
        m.placeholder,

        ms.id AS state_id,
        ms.state_key,
        ms.state_label,
        ms.border_game,
        ms.strategy_text,
        ms.sort_order AS state_sort_order,

        ep.game,
        ep.value,
        ep.sort_order AS point_sort_order

      FROM machines m

      LEFT JOIN machine_states ms
        ON ms.machine_id = m.id

      LEFT JOIN expectation_points ep
        ON ep.machine_state_id = ms.id

      WHERE m.active = true

      ORDER BY
        m.id,
        ms.sort_order,
        ep.game
    `;

    const machines = {};

    for (const row of rows) {

      if (!machines[row.machine_key]) {
        machines[row.machine_key] = {
          id: row.machine_id,
          key: row.machine_key,
          name: row.machine_name,
          manufacturer: row.manufacturer,
          machine_type: row.machine_type,
          placeholder: row.placeholder,
          states: []
        };
      }

      const machine = machines[row.machine_key];

      let state = machine.states.find(
        s => s.id === row.state_key
      );

      if (!state) {
        state = {
          id: row.state_key,
          label: row.state_label,
          borderGame: row.border_game,
          strategyText: row.strategy_text,
          points: []
        };

        machine.states.push(state);
      }

      if (row.game !== null) {
        state.points.push({
          game: row.game,
          value: row.value
        });
      }
    }

    return res.status(200).json({
      success: true,
      machines: Object.values(machines)
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