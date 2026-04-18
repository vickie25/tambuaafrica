# Generate Supabase TypeScript Types

The TypeScript lint errors you're seeing are because the Supabase client doesn't have type definitions for your custom tables (safaris, destinations, blogs, carousel_images).

## Steps to Generate Types

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI globally:**
```bash
npm install -g supabase
```

2. **Link your project to Supabase:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
You can find your project reference in your Supabase dashboard under Settings > API

3. **Generate TypeScript types:**
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

4. **Update the Supabase client import:**
Update your `src/integrations/supabase/client.ts` to use the generated types:
```typescript
import { Database } from '@/types/supabase';
```

### Option 2: Using the Supabase Dashboard (Quick Alternative)

1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Click on "TypeScript" tab
4. Copy the generated types
5. Create `src/types/supabase.ts` and paste the types
6. Update your Supabase client to use these types

### Option 3: Manual Type Definitions (Temporary Fix)

If you want a quick fix without generating types, you can add this to your `src/types/supabase.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      safaris: {
        Row: {
          id: string;
          title: string;
          location: string;
          duration: string;
          price: number;
          rating: number;
          reviews: number;
          image: string;
          description: string;
          highlights: string[];
          category: string;
          stripe_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          location: string;
          duration: string;
          price: number;
          rating?: number;
          reviews?: number;
          image: string;
          description: string;
          highlights?: string[];
          category: string;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          location?: string;
          duration?: string;
          price?: number;
          rating?: number;
          reviews?: number;
          image?: string;
          description?: string;
          highlights?: string[];
          category?: string;
          stripe_price_id?: string | null;
          updated_at?: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          country: string;
          description: string;
          image: string;
          safari_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          country: string;
          description: string;
          image: string;
          safari_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          description?: string;
          image?: string;
          safari_count?: number;
          updated_at?: string;
        };
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          excerpt: string;
          image: string;
          date: string;
          category: string;
          read_time: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          excerpt: string;
          image: string;
          date: string;
          category: string;
          read_time: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          excerpt?: string;
          image?: string;
          date?: string;
          category?: string;
          read_time?: string;
          content?: string;
          updated_at?: string;
        };
      };
      carousel_images: {
        Row: {
          id: string;
          url: string;
          title: string;
          description: string | null;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          url: string;
          title: string;
          description?: string | null;
          order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string;
          description?: string | null;
          order?: number;
          updated_at?: string;
        };
      };
    };
  };
}
```

Then update your Supabase client initialization to use these types.

## After Generating Types

Update `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

This will eliminate all the TypeScript lint errors and provide full type safety for your database queries.
