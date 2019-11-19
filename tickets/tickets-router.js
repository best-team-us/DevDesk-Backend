const router = require('express').Router();
const request = require('request');
const axios = require('axios');

const ticketsDb = require('./tickets-model');

const db = require('../data/db-config');



router.get('/open', async (req, res) => {
    try{
        const tickets = await ticketsDb.findOpen();
        res.status(200).json(tickets);
    }catch(err){
        res.status(500).json({message: 'Error retrieving open tickets'});
    }
});

router.get('/resolved', async (req, res) => {
    try{
        const tickets = await ticketsDb.findResolved();
        res.status(200).json(tickets);
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Error retrieving open tickets'});
    }
});

router.get('/students/student/open', async (req, res) => {
    const {id} = req.user;
    try{
        const tickets = await ticketsDb.findStudentOpenTickets(id);
        if(tickets.length){
            res.status(200).json(tickets);
        }else{
            res.status(404).json({message: `No open tickets found for student with id ${id}`})
        }
        
    }catch(err){
        console.log(err);
        res.status(500).json({message: `Error retrieving open tickets for student with id ${id}`});
    }
});

router.get('/students/student/resolved', async (req, res) => {
    const {id} = req.user;
    try{
        const tickets = await ticketsDb.findStudentResolvedTickets(id);
        if(tickets.length){
            res.status(200).json(tickets);
        }else{
            res.status(404).json({message: `No resolved tickets found for student with id ${id}`})
        }
        
    }catch(err){
        console.log(err);
        res.status(500).json({message: `Error retrieving resolved tickets for student with id ${id}`});
    }
});

router.get('/helpers/:id', async (req, res) => {
    const {id} = req.params;
    try{
        const tickets = await ticketsDb.findHelperTickets(id);
        if(tickets.length){
            res.status(200).json(tickets);
        }else{
            res.status(404).json({message: `No tickets found for helper with id ${id}`});
        }

    }catch(err){
        console.log(err);
        res.status(500).json({message: `Error retrieving tickets for helper with id ${id}`});
    }
});

router.post('/', async (req, res) => {
    try {
        const {category, title, description} = req.body;
        const ticket = await ticketsDb.openTicket({category, title, description}, req.user.id);

        const message = `Hey! \nA user just opened a ticket in category ${ticket.category}\nTicket title: ${ticket.title}\nDescription: ${ticket.description} \n :hotdog:\n`

        var data = {form: {
            token: process.env.SLACK_AUTH_TOKEN,
            channel: "#generall",
            text: message,
            blocks: JSON.stringify([
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": `Ticket id: ${ticket.id}`
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "A new ticket has been opened:\n <https://lambdadevdesk.now.sh/|Click here to view.>"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Category:*\n${ticket.category}\n*Title:*\n${ticket.title}\n*Description:*\n${ticket.description}`
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://res.cloudinary.com/duoz4fpzs/image/upload/v1574148471/ssetylq8etg7svhvnulq.png",
                        "alt_text": "computer thumbnail"
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": `Ticket created on: ${ticket.created_at}`
                        }
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Help Student"
                            },
                            "action_id": "assign_ticket",
                            "style": "primary",
                            "value": "click_me_123"
                        },
                    ]
                }
            ])
          }};
  
        request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {});
        

        res.status(201).json(ticket);
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Error opening ticket'});
    }
});

router.post('/:id/help', async (req, res) => {
    const {slack, user_id} = req.body;
    try {
        const ticket = await ticketsDb.assignTicket(req.params.id, req.user.id);
        if(slack && user_id){
            var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                user: user_id
                }
            };
            
            const id = await request.post('https://slack.com/api/im.open', data, async function (error, response, body) {
                const {id} = (JSON.parse(body).channel);
                data = {form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: id,
                    text: `You have successfully been assigned to ticket with id ${req.params.id}`
                    }
                }
    
                await request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {});
            });
        }
        res.status(201).json(ticket);
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Error assigning ticket'});
    }
});

router.delete('/:id/queue', async (req, res) => {
    try {
        const {id} = req.params;
        const returned = await ticketsDb.returnToQueue(id);
        if(returned){
            res.status(200).json({message: `Ticket with id ${id} returned to the queue.`});
        }else{
            res.status(404).json(`Ticket with id ${id} not found.`);
        }
    }catch(err){
        res.status(500).json({message: 'Server could not return the ticket to the queue.'});
    }
});

router.put('/:id', async (req, res) => {
    const {id} = req.params;
    try{
        const result = await db('students_tickets as s')
            .where({'s.ticket_id': id})
            .select('s.student_id');
        
        if(result.length){
            const [{student_id}] = result;
            if(student_id === req.user.id){
                const {category, title, description} = req.body;
                const ticket = {category, title, description};
                Object.keys(ticket).forEach(key => ticket[key] === undefined && delete ticket[key])
                const updated = await ticketsDb.update(id, ticket);
                
                if(updated){
                    const ticket = await db('tickets')
                        .where({id})
                        .first();
                    res.status(200).json(ticket);
                }else{
                    throw 'Ticket could not be updated.'
                }
            }else{
                res.status(403).json({message: `You are not the author of the ticket with id ${id}`});
            }
        }else{
            throw 'Empty result'
        }
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Error updating ticket.'});
    }
});

router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    try{
        const found = await db('tickets')
        .where({id})
        .first();

        const  open = await db('students_tickets')
        .where({ticket_id: id})
        .first()
        .select('student_id');

        const  resolved = await db('resolved_tickets')
        .where({ticket_id: id})
        .first()
        .select('student_id');
        
        if(found){
            if((open && open.student_id === req.user.id) || (resolved && resolved.student_id === req.user.id)){
                const deleted = await ticketsDb.remove(id);
                if(deleted){
                    res.status(200).json({message: `Ticket with id ${id} successfully deleted.`});
                }
            }else{
                res.status(403).json({message: `You are not the author of the ticket with id ${id}`});
            }
        }else{
            res.status(404).json({message: `Ticket with id ${id} not found.`});
        }
        
    }catch(err){
        res.status(500).json({message: `Error deleting ticket with id ${id}`});
    }
});

router.post('/:id/resolve', async (req, res) => {
    const {id} = req.params;
    const {solution} = req.body;
    try{
    const ticket = await ticketsDb.resolve(parseInt(id), req.user.id, solution);
    res.status(201).json(ticket);
    }catch(err){
        if(err === 1){
            res.status(403).json({message: `Error resolving ticket with id ${id}. If you are a student you did not open this ticket. If you are a helper you are not assigned to it.`});
        }else{
            res.status(500).json({message: `Error resolving ticket with id ${id}`});
        }
    }
});

router.put('/resolved/:id', async (req, res) => {
    const {id} = req.params;
    const {solution} = req.body;
    try{
        const ticket = await ticketsDb.updateSolution(id, req.user.id, solution);
        res.status(200).json({ticket});
    }catch(err){
        if(err === 1){
            res.status(403).json({message: `Error resolving ticket with id ${id}. If you are a student you did not open this ticket. If you are a helper you are not assigned to it.`});
        }else if(err === 2){
            res.status(404).json({message: `There are no resolved tickets with id ${id}.`});
        }else{
            console.log(err);
            res.status(500).json({message: `Error updating solution for ticket with id ${id}`});
        }
    }
});

module.exports = router;