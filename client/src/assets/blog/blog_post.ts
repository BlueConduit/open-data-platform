// Minimum content for rendering a post.
export interface BlogPost {
  // Title of post.
  title: string;
  // Primary image under the header.
  image?: string;
  // HTML of post, including links, images, etc.
  // Must begin with <p> tag to generate a preview.
  content: string;
  // Route associated with blog.
  route: string;
}
