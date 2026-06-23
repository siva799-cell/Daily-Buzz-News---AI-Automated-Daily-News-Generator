import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import NewsPost from '@/models/NewsPost';
import { verifyAdminToken } from '@/lib/adminAuth';

// Update post status or content
export async function PUT(request, { params }) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();

    const post = await NewsPost.findById(id);

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    // Update allowable fields
    const fieldsToUpdate = [
      'title', 'summary', 'keyPoints', 'category', 'status',
      'city', 'state', 'country', 'confidenceScore', 'imageUrl'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        post[field] = body[field];
      }
    });

    // If status is transitioning to approved, update the timestamp
    if (body.status === 'approved' && post.status !== 'approved') {
      post.publishedAt = new Date();
    }

    await post.save();

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error updating post by admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete post
export async function DELETE(request, { params }) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const deletedPost = await NewsPost.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post by admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
