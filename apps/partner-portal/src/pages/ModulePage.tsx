import React, { useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { Pencil, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ModuleLayout } from "@repo/ui/module";
import {UserModuleAPI} from "@repo/shared-state/api";

type User = {
    name: string;
    email: string;
    mobile: string;
    role_id: string;
    role_name: string;
    supervisor_user_id: string;
    supervisor_name: string;
    address: string;
    pincode_id: number;
    status: number;
    created_at: string;
};

const EmployeeUserList: React.FC = () => {

    const userModuleAPI = UserModuleAPI.getInstance();
    console.log("userModuleAPI", userModuleAPI);
    const [users, setUsers] = useState<User[]>([
        {
            name: "Samson",
            email: "samson@gh.com",
            mobile: "6214568596",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171612",
            supervisor_name: "Vignesh",
            address: "2/99B",
            pincode_id: 142744,
            status: 1,
            created_at: "2025-10-08T10:00:00+05:30",
        },
        {
            name: "Mano",
            email: "mano@gh.com",
            mobile: "5685685899",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171613",
            supervisor_name: "Arun",
            address: "12/4C",
            pincode_id: 142745,
            status: 1,
            created_at: "2025-10-08T11:00:00+05:30",
        },
        {
            name: "Aravind",
            email: "aravind@gh.com",
            mobile: "9812365478",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171614",
            supervisor_name: "Kumar",
            address: "45A, South Street",
            pincode_id: 142746,
            status: 1,
            created_at: "2025-10-07T09:30:00+05:30",
        },
        {
            name: "Divya",
            email: "divya@gh.com",
            mobile: "9856214578",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171612",
            supervisor_name: "Vignesh",
            address: "10/3B, Anna Nagar",
            pincode_id: 142747,
            status: 1,
            created_at: "2025-10-07T12:00:00+05:30",
        },
        {
            name: "Suresh",
            email: "suresh@gh.com",
            mobile: "7854123698",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171613",
            supervisor_name: "Arun",
            address: "89/1, Gandhi Road",
            pincode_id: 142748,
            status: 1,
            created_at: "2025-10-06T14:30:00+05:30",
        },
        {
            name: "Priya",
            email: "priya@gh.com",
            mobile: "9845213698",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171615",
            supervisor_name: "Karthik",
            address: "55, North Street",
            pincode_id: 142749,
            status: 1,
            created_at: "2025-10-05T09:45:00+05:30",
        },
        {
            name: "Ravi",
            email: "ravi@gh.com",
            mobile: "9998541236",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171616",
            supervisor_name: "Pandiyan",
            address: "22/1, Market Road",
            pincode_id: 142750,
            status: 0,
            created_at: "2025-10-04T16:20:00+05:30",
        },
        {
            name: "Meena",
            email: "meena@gh.com",
            mobile: "9512364785",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171612",
            supervisor_name: "Vignesh",
            address: "78/6, Temple Street",
            pincode_id: 142751,
            status: 1,
            created_at: "2025-10-03T10:50:00+05:30",
        },
        {
            name: "Kavin",
            email: "kavin@gh.com",
            mobile: "9823561478",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171613",
            supervisor_name: "Arun",
            address: "14, West Cross",
            pincode_id: 142752,
            status: 1,
            created_at: "2025-10-02T18:15:00+05:30",
        },
        {
            name: "Devi",
            email: "devi@gh.com",
            mobile: "9745236987",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171615",
            supervisor_name: "Karthik",
            address: "8/9, East Main Road",
            pincode_id: 142753,
            status: 1,
            created_at: "2025-10-02T10:10:00+05:30",
        },
        {
            name: "Hari",
            email: "hari@gh.com",
            mobile: "9587412365",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171614",
            supervisor_name: "Kumar",
            address: "6/4, Central Colony",
            pincode_id: 142754,
            status: 0,
            created_at: "2025-10-01T08:40:00+05:30",
        },
        {
            name: "Latha",
            email: "latha@gh.com",
            mobile: "9698745123",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171613",
            supervisor_name: "Arun",
            address: "2/4C, Vinayagar Kovil St",
            pincode_id: 142755,
            status: 1,
            created_at: "2025-09-30T12:25:00+05:30",
        },
        {
            name: "Vimal",
            email: "vimal@gh.com",
            mobile: "9814523698",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171616",
            supervisor_name: "Pandiyan",
            address: "9A, College Road",
            pincode_id: 142756,
            status: 1,
            created_at: "2025-09-29T17:40:00+05:30",
        },
        {
            name: "Anu",
            email: "anu@gh.com",
            mobile: "9912358741",
            role_id: "170868785744245634",
            role_name: "DSA-Employee",
            supervisor_user_id: "175333607487171614",
            supervisor_name: "Kumar",
            address: "4/1, Gandhi Nagar",
            pincode_id: 142757,
            status: 1,
            created_at: "2025-09-29T09:05:00+05:30",
        },
        {
            name: "Naveen",
            email: "naveen@gh.com",
            mobile: "9945786321",
            role_id: "170868785744245635",
            role_name: "Relationship Manager",
            supervisor_user_id: "175333607487171613",
            supervisor_name: "Arun",
            address: "22B, New Colony",
            pincode_id: 142758,
            status: 1,
            created_at: "2025-09-28T15:00:00+05:30",
        },
    ]);


    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        role_id: "",
        name: "",
        email: "",
        mobile: "",
        supervisor_user_id: "",
        address: "",
        pincode_id: "",
    });

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = () => {
        const { role_id, name, email, mobile, supervisor_user_id, address, pincode_id } =
            formData;
        if (!role_id || !name || !email || !mobile || !address || !pincode_id) {
            toast.warning("Please fill all required fields.");
            return;
        }

        try {
            const payload = {
                role_id,
                name,
                email,
                mobile,
                status: 1,
                supervisor_user_id,
                employee_id: "",
                address,
                pincode_id: Number(pincode_id),
            };

            setUsers([
                ...users,
                {
                    ...payload,
                    role_name:
                        role_id === "170868785744245635" ? "Relationship Manager" : "DSA-Employee",
                    supervisor_name:
                        supervisor_user_id === "175333607487171613" ? "Pandiyan" : "Vignesh",
                    created_at: new Date().toISOString(),
                },
            ]);
            toast.success("User added successfully!");
            setFormData({
                role_id: "",
                name: "",
                email: "",
                mobile: "",
                supervisor_user_id: "",
                address: "",
                pincode_id: "",
            });
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to save user data.");
        }
    };

    // filter + paginate
    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedUsers = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    return (
        <ModuleLayout>
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg border border-slate-200">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <Input
                        placeholder="🔍 Search by name..."
                        className="w-64 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                <Plus className="w-4 h-4" /> Add User
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add User</DialogTitle>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Role *</Label>
                                    <select
                                        name="role_id"
                                        value={formData.role_id}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="170868785744245634">DSA-Employee</option>
                                        <option value="170868785744245635">Relationship Manager</option>
                                    </select>
                                </div>

                                <div>
                                    <Label>Supervisor *</Label>
                                    <select
                                        name="supervisor_user_id"
                                        value={formData.supervisor_user_id}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    >
                                        <option value="">Select Supervisor</option>
                                        <option value="175333607487171612">Vignesh</option>
                                        <option value="175333607487171613">Pandiyan</option>
                                    </select>
                                </div>

                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div>
                                    <Label>Mobile *</Label>
                                    <Input
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Enter mobile"
                                    />
                                </div>

                                <div>
                                    <Label>Address *</Label>
                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter address"
                                    />
                                </div>

                                <div>
                                    <Label>Pincode *</Label>
                                    <Input
                                        name="pincode_id"
                                        value={formData.pincode_id}
                                        onChange={handleChange}
                                        placeholder="Enter pincode id"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                >
                                    Submit
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table Section */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100">
                                <TableHead>#</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length ? (
                                paginatedUsers.map((user, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-blue-50 transition-colors duration-150"
                                    >
                                        <TableCell>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell>{user.role_name}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.mobile}</TableCell>
                                        <TableCell>{user.supervisor_name}</TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString("en-GB")}
                                        </TableCell>
                                        <TableCell>
                                            {user.status === 1 ? (
                                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="icon">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                                        No records found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-600">
            Showing{" "}
              <strong>
              {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filtered.length)}
            </strong>{" "}
              of <strong>{filtered.length}</strong> users
          </span>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={prevPage}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        {/* Page Number Display */}
                        <span className="text-sm font-medium text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={nextPage}
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                </div>
            </div>
        </ModuleLayout>
    );
};

export default EmployeeUserList;
