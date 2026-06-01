// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '../../../../model/User';
import { getUserFromCookies } from '@/lib/helper';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Only Admin can add members
    const currentUser = await getUserFromCookies();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admin can add new members' },
        { status: 403 }
      );
    }

    const {
      name,
      email,
      phone,
      employeeId,
      password,
      role,
      department,
      joiningDate,
      target,
      salary,           // ← New Field Added
    } = await request.json();

    // Validation
    if (!name || !email || !employeeId || !role) {
      return NextResponse.json(
        { success: false, message: 'Name, Email, Employee ID and Role are required' },
        { status: 400 }
      );
    }

    // Check if email or employeeId already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or Employee ID already exists' },
        { status: 409 }
      );
    }

    // Password Logic
    let finalPassword: string;
    
    if (password && password.trim().length >= 2) {
      finalPassword = password;
    } else {
      finalPassword = employeeId;
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 12);

    // Create new user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      employeeId,
      role,
      department,
      joiningDate: joiningDate ? new Date(joiningDate) : Date.now(),
      target: target ? Number(target) : 0,
      salary: salary ? Number(salary) : 0,           // ← Salary Added
      password: hashedPassword,
      isActive: true,
      permissions: role === 'admin' ? ['all'] : ['leads.view', 'leads.create'],
    });

    return NextResponse.json({
      success: true,
      message: 'Member added successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        employeeId: newUser.employeeId,
        role: newUser.role,
        department: newUser.department,
        salary: newUser.salary,          // ← Return salary too
      },
      defaultPassword: finalPassword,
      note: "Please share this password with the new member"
    });

  } catch (error: any) {
    console.error('Add Member Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}