const db = require('../data/db-config');

module.exports = {
    findOpen,
    findResolved,
    findStudentOpenTickets,
    findStudentResolvedTickets,
    findHelperTickets,
    openTicket,
    assignTicket,
    returnToQueue,
    update,
    remove,
    resolve,
    updateSolution,
    findHelperResolvedTickets,
    findById,
    findTicketComments,
    addComment,
    deleteComment,
    addReply,
    deleteReply
};

function findOpen() {
    return db('authors_tickets as s')
    .join('tickets as t', 's.ticket_id', 't.id')
    .join('users as u', 's.author_id', 'u.id')
    .leftJoin('profile_pictures as p', 's.author_id', 'p.user_id')
    .whereNotExists(function () {
        this.select('*').from('helpers_tickets as h').whereRaw('s.ticket_id = h.ticket_id');
    })
    .select('t.*', 'u.name as author_name', 's.author_id', 'p.url as author_image', db.raw('? as status', ['open']));
}

function findResolved() {
    return db('tickets as t')
    .join('resolved_tickets as r', 't.id', 'r.ticket_id')
    .leftJoin('users as h', 'h.id', 'r.helper_id')
    .leftJoin('users as s', 's.id', 'r.author_id')
    .leftJoin('profile_pictures as hp', 'h.id', 'hp.user_id')
    .leftJoin('profile_pictures as sp', 's.id', 'sp.user_id')
    .select('t.*', 'h.name as helper_name', 's.name as author_name', 'hp.url as helper_image', 'sp.url as author_image','r.helper_id', 'r.author_id', 'r.resolved_at', db.raw('? as status', ['resolved']));
}


function findStudentOpenTickets(id){
    return db('authors_tickets as s')
    .where({'s.author_id': id})
    .join('tickets as t', 's.ticket_id', 't.id')
    .leftJoin('users as u', 's.author_id', 'u.id')
    .leftJoin('profile_pictures as p', 's.author_id', 'p.user_id')
    .select('t.*', 'u.name as author_name', 's.author_id', 'p.url as author_image', db.raw('? as status', ['open']));
}

function findStudentResolvedTickets(id){
    return db('resolved_tickets as r')
    .where({'r.author_id': id})
    .join('tickets as t', 'r.ticket_id', 't.id')
    .leftJoin('users as u', 'r.author_id', 'u.id')
    .leftJoin('users as h', 'h.id', 'r.helper_id')
    .leftJoin('profile_pictures as hp', 'r.helper_id', 'hp.user_id')
    .leftJoin('profile_pictures as sp', 'r.author_id', 'sp.user_id')
    .select('t.*', 'r.resolved_at', 'u.name as author_name', 'hp.url as helper_image', 'sp.url as author_image', 'h.name as helper_name', 'r.helper_id', 'r.author_id', db.raw('? as status', ['resolved']));
}

function findHelperTickets(id){
    return db('helpers_tickets as h')
    .where({'h.helper_id': id})
    .join('tickets as t', 'h.ticket_id', 't.id')
    .leftJoin('users as uh', 'h.helper_id', 'uh.id')
    .leftJoin('authors_tickets as st', 't.id', 'st.ticket_id')
    .leftJoin('users as us', 'st.author_id', 'us.id')
    .leftJoin('profile_pictures as hp', 'h.helper_id', 'hp.user_id')
    .leftJoin('profile_pictures as sp', 'st.author_id', 'sp.user_id')
    .select('t.*', 'uh.name as helper_name', 'us.name as author_name', 'hp.url as helper_image', 'sp.url as authort_image', 'uh.id as helper_id', 'us.id as author_id', db.raw('? as status', ['assigned']));
}

function findHelperResolvedTickets(id){
    return db('resolved_tickets as rt')
    .where({'rt.helper_id': id})
    .join('tickets as t', 'rt.ticket_id', 't.id')
    .join('users as uh', 'rt.helper_id', 'uh.id')
    .leftJoin('users as us', 'rt.author_id', 'us.id')
    .leftJoin('profile_pictures as hp', 'rt.helper_id', 'hp.user_id')
    .leftJoin('profile_pictures as sp', 'rt.author_id', 'sp.user_id')
    .select('t.*', 'uh.name as helper_name', 'us.name as author_name', 'hp.url as helper_image', 'sp.url as author_image', 'uh.id as helper_id', 'us.id as author_id', db.raw('? as status', ['assigned']), 'rt.resolved_at');
}

function findBy(value){
    return db('tickets')
        .where(value)
        .first();
}

async function openTicket(ticket, author_id){
    const id = await db.transaction(async trx => {
        try{
            const [ticket_id] = await trx('tickets')
                .insert(ticket, 'id');
            await trx('authors_tickets').insert({author_id, ticket_id}, 'id');
            return ticket_id;
        }catch(err){
            throw err;
        }
    });

    return findBy({id});
}

async function assignTicket(ticket_id, helper_id){
    try{
        const [id] = await db('helpers_tickets')
            .insert({ticket_id, helper_id}, 'id');
        
        return findById(ticket_id);
    }catch(err){
        throw err;
    }
}

function returnToQueue(id){
    return db('helpers_tickets')
    .where({ticket_id: id})
    .del();
}

function update(id, ticket){
    return db('tickets')
    .where({id})
    .update({...ticket});
}

async function findById(id) {
    return await db('tickets as t')
            .where({'t.id': id})
            .leftJoin('authors_tickets as st', 't.id', 'st.ticket_id')
            .leftJoin('helpers_tickets as ht', 't.id', 'ht.ticket_id')
            .leftJoin('resolved_tickets as rt', 't.id', 'rt.ticket_id')
            .leftJoin('users as su', 'st.author_id', 'su.id')
            .leftJoin('users as hu', 'ht.helper_id', 'hu.id')
            .leftJoin('users as rsu', 'rt.author_id', 'rsu.id')
            .leftJoin('users as rhu', 'rt.helper_id', 'rhu.id')
            .leftJoin('profile_pictures as hp', 'ht.helper_id', 'hp.user_id')
            .leftJoin('profile_pictures as sp', 'st.author_id', 'sp.user_id')
            .leftJoin('profile_pictures as rhp', 'rt.helper_id', 'hp.user_id')
            .leftJoin('profile_pictures as rsp', 'rt.author_id', 'sp.user_id')
            .leftJoin('tickets_videos as dv', 't.id', 'dv.ticket_id')
            .leftJoin('tickets_solutions_videos as sv', 't.id', 'sv.ticket_id')
            .select('t.*', 'dv.url as open_video', 'sv.url as resolved_video', 'rt.solution as solution',
            db.raw(`CASE 
                WHEN st.author_id IS NOT NULL THEN sp.url
                WHEN su.name IS NULL AND rsu.name IS NOT NULL THEN rsp.url
                ELSE NULL 
                END AS author_image`),
            db.raw(`CASE 
                WHEN ht.helper_id IS NOT NULL THEN hp.url
                WHEN hu.name IS NULL AND rhu.name IS NOT NULL THEN rhp.url
                ELSE NULL 
                END AS helper_image`),                
            db.raw(`CASE 
                WHEN su.name IS NOT NULL THEN su.name
                WHEN su.name IS NULL AND rsu.name IS NOT NULL THEN rsu.name
                ELSE NULL 
                END AS author_name`),
            db.raw(`CASE 
                WHEN su.name IS NOT NULL THEN su.id
                WHEN su.name IS NULL AND rsu.name IS NOT NULL THEN rsu.id
                ELSE NULL 
                END AS author_id`),                
            db.raw(`CASE 
                WHEN hu.name IS NOT NULL THEN hu.name
                WHEN hu.name IS NULL AND rhu.name IS NOT NULL THEN rhu.name
                ELSE NULL 
                END AS helper_name`),
            db.raw(`CASE 
                WHEN su.name IS NOT NULL AND hu.name IS NULL THEN 'open' 
                WHEN su.name IS NOT NULL AND hu.name IS NOT NULL THEN 'assigned'
                ELSE 'resolved'
                END AS status`),
            db.raw(`CASE
                WHEN rt.id IS NOT NULL THEN rt.resolved_at ELSE NULL
                END as resolved_at`));
}

async function remove(id){
    return await db.transaction(async trx => {
        try{
            const ticketsDeleted = await trx('tickets')
            .where({id})
            .del();
            
            if(!ticketsDeleted){
                throw 'Error removing ticket from tickets'
            }

            const resolvedFound = await trx('resolved_tickets')
            .where({ticket_id: id})
            .first();

            const resolvedDeleted = await trx('resolved_tickets')
            .where({ticket_id: id})
            .del();

            if(resolvedFound && !resolvedDeleted){
                throw 'Error removing ticket from resolved_tickets'
            }

            return true;
        }catch(err){
            return false;
        }
    });
}

async function resolve(ticket_id, user_id, solution){
    try {
        const [user] = await db('users')
        .where({id: user_id});

        const author = await db('authors_tickets')
        .where({ticket_id})
        .first()
        .select('author_id');

        const helper = await db('helpers_tickets')
        .where({ticket_id})
        .first()
        .select('helper_id');

        const helper_id = helper && helper.helper_id;
        const author_id = author && author.author_id;
        
        if((user.helper && user.id === helper_id) || (user.student && user.id === author_id)){
            const values = {author_id, helper_id, ticket_id, solution};
            Object.keys(values).forEach(key => values[key] === undefined && delete values[key]);
            const resolved = await db('resolved_tickets').insert(values);
            
            if(resolved){
                const resolvedTicket = await db('tickets as t')
                .where({'t.id': ticket_id})
                .join('resolved_tickets as r', 't.id', 'r.ticket_id')
                .select('t.*', 'r.resolved_at', 'r.solution');

                return resolvedTicket;
            }else{
                throw 'Error inserting into resolved_tickets';
            }
        }else{
            throw 1
        }
    }catch(err){
        throw err;
    }
}

async function updateSolution(ticket_id, user_id, solution){
    try{
        const found = await db('resolved_tickets')
        .where({ticket_id})
        .first();
        
        if(!found){
            throw 2;
        }
        
        const {author_id, helper_id} = found;
        const [user] = await db('users')
        .where({id: user_id});

        if((user.helper && user.id === helper_id) || (user.student && user.id === author_id)){
            const updated = await db('resolved_tickets')
            .where({ticket_id})
            .update({solution});

            if(updated){
                return await db('tickets as t')
                .where({'t.id': ticket_id})
                .join('resolved_tickets as r', 't.id', 'r.ticket_id')
                .select('t.*', 'r.resolved_at', 'r.solution');
            }else{
                throw 'Error updating solution.'
            }
        }else{
            throw 1;
        }
    }catch(err){
        throw err;
    }
}

//comments
async function findTicketComments(ticket_id){
    const comments = await db('tickets_comments as tc')
        .where({ticket_id})
        .join('comments as c', 'tc.comment_id', 'c.id')
        .select('c.*');
    
   return Promise.all(comments.map(async comment => {
        return {...comment,
                comment_pictures: await findCommentPictures(comment.id),
                comment_videos: await findCommentVideos(comment.id),
                comment_replies: await findCommentReplies(comment.id)};
    }));
}

async function findCommentReplies(comment_id){
    const replies = await db('comments_replies')
        .where({comment_id});

    return Promise.all(replies.map(async reply => {
        return {...reply,
                reply_pictures: await findReplyPictures(reply.id),
                reply_videos: await findReplyVideos(reply.id)};
    }));
}

function findCommentPictures(comment_id){
    return db('comments_pictures')
        .where({comment_id});
}

function findCommentVideos(comment_id){
    return db('comments_videos')
        .where({comment_id});
}

function findReplyPictures(reply_id){
    return db('comments_replies_pictures')
        .where({reply_id});
}

function findReplyVideos(reply_id){
    return db('comments_replies_videos')
        .where({reply_id});
}

async function addComment(ticket_id, description){
    return await db.transaction(async trx => {
        try{
            const [comment_id] = await trx('comments')
                .insert({description}, 'id');
            await trx('tickets_comments').insert({ticket_id, comment_id}, 'id');
            return comment_id;
        }catch(err){
            throw err;
        }
    });
}

function deleteComment(id){
    return db('comments')
        .where({id})
        .del();
}

//replies
async function addReply(comment_id, description){
    return await db('comments_replies')
        .insert({comment_id, description}, 'id');
}

function deleteReply(id){
    return db('comments_replies')
        .where({id})
        .del();
}