import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    } else {
      console.error('Ocorreu um erro desconhecido ao conectar ao MongoDB');
    }
    process.exit(1);
  }
};

export default connectDB;