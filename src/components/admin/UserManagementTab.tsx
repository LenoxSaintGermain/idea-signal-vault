
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/types';

interface UserManagementTabProps {
  users: User[];
}

const UserManagementTab = ({ users }: UserManagementTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Signal Points</TableHead>
              <TableHead>Ideas Influenced</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.signalPoints.toLocaleString()}</TableCell>
                <TableCell>{user.ideasInfluenced}</TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge className="bg-red-600">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagementTab;
