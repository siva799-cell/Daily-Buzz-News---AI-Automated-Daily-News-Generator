import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import NewsPost from '@/models/NewsPost';

export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const post = await NewsPost.findOne({ slug });

    if (!post) {
      return NextResponse.json({ success: false, error: 'News post not found' }, { status: 404 });
    }

    const postObj = post.toObject();

    return NextResponse.json({ success: true, post: postObj });
  } catch (error) {
    console.error('Error fetching single post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
