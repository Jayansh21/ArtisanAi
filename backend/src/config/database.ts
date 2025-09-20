import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artisanai';
    
    // Connection options for better reliability (compatible with modern drivers)
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    } as const;
    
    // Disable bufferCommands globally in Mongoose (replacement for deprecated driver options)
    mongoose.set('bufferCommands', false);
    
    await mongoose.connect(mongoURI, options);
    console.log('📦 MongoDB Connected Successfully');

    // Event listeners for real-time connection status
    mongoose.connection.on('connected', () => {
      console.log('Mongoose: Connection is open');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose: Connection error', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose: Connection disconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose: Connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Optional helper function to check connection state anywhere in your app
export const isMongoConnected = (): boolean => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1;
};
