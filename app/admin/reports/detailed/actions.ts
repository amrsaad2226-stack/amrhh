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
        const attendance = await prisma.attendance.findUnique({
            where: { id: data.id },
            include: { employee: true },
        });

        if (!attendance) {
            return { error: 'سجل الحضور غير موجود' };
        }

        const { employee } = attendance;
        let duration = 0;
        let overtime = 0;

        if (data.checkIn && data.checkOut) {
            const checkInDate = new Date(data.checkIn);
            const checkOutDate = new Date(data.checkOut);
            
            duration = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
            if (duration < 0) {
                duration += 24;
            }

            const dailyHours = employee.dailyHours || 0;
            const overtimeRate = employee.overtimeRate || 1;
            const overtimeHours = Math.max(0, duration - dailyHours);
            overtime = overtimeHours * overtimeRate;
        }

        await prisma.attendance.update({
            where: { id: data.id },
            data: {
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                notes: data.notes,
                duration: duration,
                overtime: overtime,
            },
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
                note: data.notes,
                date: data.date,
            },
        });
        revalidatePath('/admin/reports/detailed');
        return { success: 'تم تحديث السلفة بنجاح' };
    } catch (error) {
        console.error(error);
        return { error: 'فشل تحديث السلفة' };
    }
}

// --- CREATE ACTION ---
interface CreateAttendanceData {
    employeeId: number;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    notes: string;
}

export async function createAttendanceAction(data: CreateAttendanceData) {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: data.employeeId },
        });

        if (!employee) {
            return { error: 'الموظف غير موجود' };
        }

        let duration = 0;
        let overtime = 0;

        if (data.checkIn && data.checkOut) {
            const checkInDate = new Date(`${data.date}T${data.checkIn}:00+03:00`);
            const checkOutDate = new Date(`${data.date}T${data.checkOut}:00+03:00`);
            
            duration = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
            if (duration < 0) {
                duration += 24;
            }

            const dailyHours = employee.dailyHours || 0;
            const overtimeRate = employee.overtimeRate || 1;
            const overtimeHours = Math.max(0, duration - dailyHours);
            overtime = overtimeHours * overtimeRate;
        }
        
        await prisma.attendance.create({
            data: {
                employeeId: data.employeeId,
                date: new Date(data.date),
                checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}:00+03:00`) : null,
                checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}:00+03:00`) : null,
                notes: data.notes,
                duration,
                overtime,
            },
        });

        revalidatePath('/admin/reports/detailed');

        return {
            success: 'تم إضافة حركة الحضور والانصراف بنجاح',
        };
    } catch (error) {
        console.error(error);

        return {
            error: 'فشل إضافة حركة الحضور والانصراف',
        };
    }
}
