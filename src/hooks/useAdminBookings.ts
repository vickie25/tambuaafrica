import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminBooking {
  id: string;
  safari_title: string;
  preferred_date: string;
  guests: number;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  phone: string;
}

export interface Inquiry {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  inquiry_type: "contact" | "booking";
  subject: string | null;
  message: string | null;
  status: string;
  safari_title: string | null;
  preferred_date: string | null;
  guests: string | null;
}

export const useAdminBookings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100); // Limit to prevent loading too many records

      if (error) throw error;
      return data as AdminBooking[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Real-time subscription for bookings - temporarily disabled for performance
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('admin-bookings-changes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'bookings'
  //       },
  //       (payload) => {
  //         console.log('Admin bookings real-time update:', payload);
  //         queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
  //       }
  //     )
  //     .subscribe();
  //
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [queryClient]);

  return query;
};

export const useAdminProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ["admin-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      if (error) throw error;
      const map: Record<string, AdminProfile> = {};
      data.forEach((p: AdminProfile) => {
        map[p.id] = p;
      });
      return map;
    },
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useUnreadInquiriesCount = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["unread-inquiries-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("inquiry_submissions")
        .select("*", { count: 'exact', head: true })
        .eq("status", "unread");

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 1000 * 60 * 2, // Check every 2 minutes
  });

  // Real-time subscription for unread count - temporarily disabled for performance
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('unread-inquiries-count-changes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'inquiry_submissions'
  //       },
  //       (payload) => {
  //         console.log('Unread inquiries count real-time update:', payload);
  //         queryClient.invalidateQueries({ queryKey: ["unread-inquiries-count"] });
  //       }
  //     )
  //     .subscribe();
  //
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [queryClient]);

  return query;
};

export const useAdminInquiries = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiry_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Inquiry[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Real-time subscription for inquiries - temporarily disabled for performance
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('admin-inquiries-changes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'inquiry_submissions'
  //       },
  //       (payload) => {
  //         console.log('Admin inquiries real-time update:', payload);
  //         queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
  //         queryClient.invalidateQueries({ queryKey: ["unread-inquiries-count"] });
  //       }
  //     )
  //     .subscribe();
  //
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [queryClient]);

  return query;
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [bookingsRes, inquiriesRes] = await Promise.all([
        supabase.from("bookings").select("total_amount").eq("status", "confirmed"),
        supabase.from("inquiry_submissions").select("*", { count: 'exact', head: true })
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (inquiriesRes.error) throw inquiriesRes.error;

      const totalRevenue = (bookingsRes.data || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      return {
        revenue: totalRevenue / 100,
        inquiriesCount: inquiriesRes.count || 0
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
