// Database schema checker for orders table
// Run this in browser console to see available columns

const checkOrdersSchema = async () => {
  console.log('🔍 Checking Orders Table Schema...\n');
  
  try {
    // Import supabase client
    const { supabase } = await import('./supabaseClient.js');
    
    // Try to get one order to see the schema
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const sampleOrder = data[0];
      const columns = Object.keys(sampleOrder);
      
      console.log('✅ Available columns in orders table:');
      columns.forEach(column => {
        console.log(`   📄 ${column}: ${typeof sampleOrder[column]}`);
      });
      
      console.log('\n📊 Sample order structure:');
      console.log(JSON.stringify(sampleOrder, null, 2));
      
      // Check for payment-related columns
      const paymentColumns = columns.filter(col => 
        col.includes('payment') || col.includes('razorpay')
      );
      
      if (paymentColumns.length > 0) {
        console.log('\n💳 Payment-related columns found:');
        paymentColumns.forEach(col => console.log(`   💰 ${col}`));
      } else {
        console.log('\n⚠️  No payment-related columns found');
      }
      
    } else {
      console.log('ℹ️  No orders found in database');
      
      // Try to insert a test record to see what columns are required
      console.log('\n🧪 Testing minimal order creation...');
      
      const testOrder = {
        user_email: 'test@example.com',
        phone: '9999999999',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        items: [{ test: 'item' }],
        total: 1000,
        status: 'placed',
        created_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert([testOrder])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Test insert failed:', insertError);
        console.log('💡 This shows which columns are missing or have constraints');
      } else {
        console.log('✅ Test order created successfully');
        console.log('📄 Returned columns:', Object.keys(insertData));
        
        // Clean up test order
        await supabase.from('orders').delete().eq('id', insertData.id);
        console.log('🧹 Test order cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.checkOrdersSchema = checkOrdersSchema;
  console.log('Database schema checker loaded. Run checkOrdersSchema() to analyze your orders table.');
}

export default checkOrdersSchema;
