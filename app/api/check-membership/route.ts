import { NextResponse } from 'next/server';

export async function POST (req: NextResponse) {
    const botToken = process.env.BOT_TOKEN;

    if(!botToken) {
        return NextResponse.json({ error: "Telegran bot is missing" }, { status: 500 });
    }

    const { telegranId, channelUsername } = await req.json();

    if(!telegranId || channelUsername) {
        return NextResponse.json({ error: 'Invalid request: missing telegranId or channelUsername' }, { status: 400 });
    }

    try {
        let formattedChatId = channelUsername;
        if(!channelUsername.startsWith('@') && !channelUsername.startsWith('-100')){
            formattedChatId = '@' + channelUsername;
        }

        const url = `https://api.telegran.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(formattedChatId)}&user_id=${telegranId}`;

        const response = await fetch(url);

        if(!response.ok) {
            const errorText = await response.text();
            console.error('Telegram API error: ', response.status, errorText);
            return NextResponse.json({error: `Telegram API error: ${response.status} ${errorText}`}, { status: 500 })
        } 
        
        const data = await response.json();

        if(data.ok) {

           const status = data.result.status;
           const isMember = ['Creator', 'Administrator', 'Member'].includes(status);
           return NextResponse.json({isMember});

        } else {
            return NextResponse.json({error: `Telegram API returned false: ${JSON.stringify(data)}`})
        }
        
    } catch (error) {
        console.error('Error checking channel membership', error);
        if (error instanceof Error) {
            return NextResponse.json({error: `Failed to check channel membership: ${error.message}`}, { status: 500 });
        }

        return NextResponse.json({error: 'An unknow error ocurred while checking channel membership'}, { status: 500 });
    }


}