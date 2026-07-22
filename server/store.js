const { randomUUID } = require("crypto");
const db = require("./db");


// Get complete current queue state
async function publicState() {

    const configResult = await db.query(
        "SELECT min_number, max_number FROM config WHERE id=1"
    );


    const servicesResult = await db.query(
        "SELECT * FROM services ORDER BY name"
    );


    const ticketsResult = await db.query(`
        SELECT 
            t.id,
            t.number,
            t.status,
            t.created_at,
            t.called_at,
            json_build_object(
                'id', s.id,
                'name', s.name
            ) AS service
        FROM tickets t
        JOIN services s 
        ON t.service_id = s.id
        ORDER BY t.created_at ASC
    `);


    const callLogResult = await db.query(`
        SELECT
            c.id,
            t.number,
            s.name AS service,
            c.called_at
        FROM call_log c
        JOIN tickets t
        ON c.ticket_id=t.id
        JOIN services s
        ON t.service_id=s.id
        ORDER BY c.called_at DESC
        LIMIT 8
    `);


    return {

        config:{
            minNumber: configResult.rows[0].min_number,
            maxNumber: configResult.rows[0].max_number
        },

        services: servicesResult.rows,

        tickets: ticketsResult.rows,

        callLog: callLogResult.rows

    };

}





async function getAvailableNumbers(){


    const config =
        await db.query(
            "SELECT * FROM config WHERE id=1"
        );


    const tickets =
        await db.query(
            "SELECT number FROM tickets"
        );


    const taken =
        new Set(
            tickets.rows.map(
                t=>t.number
            )
        );


    const numbers=[];


    for(
        let i=config.rows[0].min_number;
        i<=config.rows[0].max_number;
        i++
    ){

        if(!taken.has(i))
            numbers.push(i);

    }


    return numbers;

}






async function createTicket({number, serviceId}){


    number=Number(number);


    const config =
        await db.query(
            "SELECT * FROM config WHERE id=1"
        );


    if(
        number < config.rows[0].min_number ||
        number > config.rows[0].max_number
    ){

        throw new Error(
            "Number outside queue range"
        );

    }



    const duplicate =
        await db.query(
            "SELECT id FROM tickets WHERE number=$1",
            [number]
        );


    if(duplicate.rows.length)
        throw new Error(
            "Number already taken"
        );



    const service =
        await db.query(
            "SELECT * FROM services WHERE id=$1",
            [serviceId]
        );


    if(service.rows.length===0)
        throw new Error(
            "Service not found"
        );



    const id=randomUUID();



    await db.query(`
        INSERT INTO tickets
        (
            id,
            number,
            service_id,
            status
        )
        VALUES
        ($1,$2,$3,'waiting')
    `,
    [
        id,
        number,
        serviceId
    ]);



    return {

        id,
        number,

        service:service.rows[0],

        status:"waiting"

    };

}






async function findTicketByNumber(number){


    const result =
        await db.query(
            `
            SELECT 
                t.*,
                json_build_object(
                    'id',s.id,
                    'name',s.name
                ) AS service
            FROM tickets t
            JOIN services s
            ON t.service_id=s.id
            WHERE number=$1
            `,
            [number]
        );


    return result.rows[0];

}







async function serveTicket(number){


    const ticket =
        await findTicketByNumber(number);



    if(!ticket)
        throw new Error(
            "Ticket not found"
        );



    await db.query(`
        UPDATE tickets
        SET status='serving',
            called_at=NOW()
        WHERE number=$1
    `,
    [
        number
    ]);



    await db.query(`
        INSERT INTO call_log(ticket_id)
        VALUES($1)
    `,
    [
        ticket.id
    ]);



    return ticket;

}







async function callNextTicket(){


    const result =
        await db.query(`
            SELECT number
            FROM tickets
            WHERE status='waiting'
            ORDER BY created_at ASC
            LIMIT 1
        `);



    if(result.rows.length===0)
        return null;



    return serveTicket(
        result.rows[0].number
    );

}







async function completeTicket(number){


    const ticket =
        await findTicketByNumber(number);



    if(!ticket)
        throw new Error(
            "Ticket not found"
        );



    await db.query(
        "DELETE FROM tickets WHERE number=$1",
        [number]
    );



    return ticket;

}







async function recallTicket(number){

    return serveTicket(number);

}







async function addService(name){


    const id=randomUUID();


    await db.query(`
        INSERT INTO services(id,name)
        VALUES($1,$2)
    `,
    [
        id,
        name
    ]);



    return {
        id,
        name
    };

}







async function updateService(id,name){


    await db.query(`
        UPDATE services
        SET name=$1
        WHERE id=$2
    `,
    [
        name,
        id
    ]);



    return {
        id,
        name
    };

}







async function deleteService(id){


    await db.query(
        "DELETE FROM services WHERE id=$1",
        [id]
    );

}







async function updateConfig({
    minNumber,
    maxNumber
}){


    await db.query(`
        UPDATE config
        SET min_number=$1,
            max_number=$2
        WHERE id=1
    `,
    [
        minNumber,
        maxNumber
    ]);



    return {
        minNumber,
        maxNumber
    };

}







module.exports={

publicState,

getAvailableNumbers,

createTicket,

findTicketByNumber,

callNextTicket,

serveTicket,

completeTicket,

recallTicket,

addService,

updateService,

deleteService,

updateConfig

};