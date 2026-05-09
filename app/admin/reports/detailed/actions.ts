'use server';

import prisma from '../../../../lib/db';
import { revalidatePath } from 'next/cache';

// --- DELETE ACTIONS ---
export async function deleteAttendanceAction(id: number) {
    try {
        await prisma.attendance.delete({ where: { id } });
        revalidatePath('/admin/reports/detailed');
        return { success: 'تم حذف سجل الحضور بنجاح' };
    } catch (error) {
        console.error(error);
        return { error: 'فشل حذف سجل الحضور' };
    }
}

export async function deleteCashTransactionAction(id: number) {
    try {
        await prisma.cashTransaction.delete({ where: { id } });
        revalidatePath('/admin/reports/detailed');
        return { success: 'تم حذف السلفة النقدية بنجاح' };
    } catch (error) {
        console.error(error);
        return { error: 'فشل حذف السلفة النقدية' };
    }
}

// --- UPDATE ACTIONS ---
interface UpdateAttendanceData {
    id: number;
    checkIn: Date | null;
    checkOut: Date | null;
    notes: string;
}

export async function updateAttendanceAction(data: UpdateAttendanceData) {
    try {
        let duration: number | null = null;
        if (data.checkIn && data.checkOut) {
            const checkInDate = new Date(data.checkIn);
            const checkOutDate = new Date(data.checkOut);
            duration = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);

            if (duration < 0) {
                duration += 24;
            }
        }

        const updateData: {
            checkIn: Date | null;
            checkOut: Date | null;
            notes: string;
            duration?: number;
        } = {
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            notes: data.notes,
        };

        if (duration !== null) {
            updateData.duration = duration;
        }

        await prisma.attendance.update({
            where: { id: data.id },
            data: updateData,
        });

        revalidatePath('/admin/reports/detailed');
        return { success: 'تم تحديث سجل الحضور بنجاح' };
    } catch (error) {
        console.error(error);
        return { error: 'فشل تحديث سجل الحضور' };
    }
}

interface UpdateCashData {
    id: number;
    amount: number;
    notes: string;
    date: Date;
}

export async function updateCashTransactionAction(data: UpdateCashData) {
    try {
        await prisma.cashTransaction.update({
            where: { id: data.id },
            data: {
                amount: data.amount,
                note: data.notes,   // Correctly mapping 'notes' from form to 'note' in DB
                date: data.date,   // Correctly using the new 'date' field
            },
        });
        revalidatePath('/admin/reports/detailed');
        return { success: 'تم تحديث السلفة بنجاح' };
    } catch (error) {
        console.error(error);
        return { error: 'فشل تحديث السلفة' };
    }
}
