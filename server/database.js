// Supabase Database Module
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase Connected');

// User Operations
const User = {
  create: async (data) => {
    const { data: user, error } = await supabase
      .from('users')
      .insert([data])
      .select();
    if (error) throw error;
    return user[0];
  },
  
  findOne: async (query) => {
    let q = supabase.from('users').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  findById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  find: async (query = {}) => {
    let q = supabase.from('users').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  
  updateOne: async (query, data) => {
    let q = supabase.from('users').update(data);
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, modifiedCount: count || 0 };
  },
  
  updateById: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
  
  deleteOne: async (query) => {
    let q = supabase.from('users').delete();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, deletedCount: count || 0 };
  },
  
  countDocuments: async (query = {}) => {
    let q = supabase.from('users').select('id', { count: 'exact', head: true });
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }
};

// Policy Operations
const Policy = {
  create: async (data) => {
    const { data: policy, error } = await supabase
      .from('policies')
      .insert([data])
      .select();
    if (error) throw error;
    return policy[0];
  },
  
  findOne: async (query) => {
    let q = supabase.from('policies').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  findById: async (id) => {
    const { data, error } = await supabase
      .from('policies')
      .select()
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  find: async (query = {}) => {
    let q = supabase.from('policies').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  
  updateOne: async (query, data) => {
    let q = supabase.from('policies').update(data);
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, modifiedCount: count || 0 };
  },
  
  updateById: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('policies')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
  
  deleteOne: async (query) => {
    let q = supabase.from('policies').delete();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, deletedCount: count || 0 };
  },
  
  countDocuments: async (query = {}) => {
    let q = supabase.from('policies').select('id', { count: 'exact', head: true });
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }
};

// Claim Operations
const Claim = {
  create: async (data) => {
    const { data: claim, error } = await supabase
      .from('claims')
      .insert([data])
      .select();
    if (error) throw error;
    return claim[0];
  },
  
  findOne: async (query) => {
    let q = supabase.from('claims').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  findById: async (id) => {
    const { data, error } = await supabase
      .from('claims')
      .select()
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  find: async (query = {}) => {
    let q = supabase.from('claims').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  
  updateOne: async (query, data) => {
    let q = supabase.from('claims').update(data);
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, modifiedCount: count || 0 };
  },
  
  countDocuments: async (query = {}) => {
    let q = supabase.from('claims').select('id', { count: 'exact', head: true });
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }
};

// LossAnalytics Operations
const LossAnalytics = {
  create: async (data) => {
    const { data: record, error } = await supabase
      .from('loss_analytics')
      .insert([data])
      .select();
    if (error) throw error;
    return record[0];
  },
  
  find: async (query = {}) => {
    let q = supabase.from('loss_analytics').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
};

// Group Operations
const Group = {
  create: async (data) => {
    const { data: group, error } = await supabase
      .from('groups')
      .insert([data])
      .select();
    if (error) throw error;
    return group[0];
  },
  
  findOne: async (query) => {
    let q = supabase.from('groups').select();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { data, error } = await q.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  find: async () => {
    const { data, error } = await supabase.from('groups').select();
    if (error) throw error;
    return data || [];
  },
  
  findById: async (id) => {
    const { data, error } = await supabase
      .from('groups')
      .select()
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  updateOne: async (query, data) => {
    let q = supabase.from('groups').update(data);
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, modifiedCount: count || 0 };
  },
  
  deleteOne: async (query) => {
    let q = supabase.from('groups').delete();
    for (let key in query) {
      q = q.eq(key, query[key]);
    }
    const { error, count } = await q;
    if (error) throw error;
    return { acknowledged: true, deletedCount: count || 0 };
  },
  
  countDocuments: async () => {
    const { count, error } = await supabase.from('groups').select('id', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
};

module.exports = {
  User,
  Policy,
  Claim,
  LossAnalytics,
  Group,
  supabase
};
