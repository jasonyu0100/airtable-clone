// Script to wipe all rows from the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipeRows() {
  try {
    console.log('Starting to wipe all rows...');
    
    // Delete all cells first (due to foreign key constraints)
    const cellsResult = await prisma.cell.deleteMany({});
    console.log(`Deleted ${cellsResult.count} cells`);
    
    // Then delete all rows
    const rowsResult = await prisma.row.deleteMany({});
    console.log(`Deleted ${rowsResult.count} rows`);
    
    console.log('Successfully wiped all rows and cells from the database!');
  } catch (error) {
    console.error('Error wiping rows:', error);
  } finally {
    await prisma.$disconnect();
  }
}

wipeRows();