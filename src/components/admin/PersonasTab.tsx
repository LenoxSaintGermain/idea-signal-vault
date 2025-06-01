
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { PersonaProfile } from '@/types/persona';

interface PersonasTabProps {
  personas: PersonaProfile[];
  onDeletePersona: (personaId: string, name: string) => void;
}

const PersonasTab = ({ personas, onDeletePersona }: PersonasTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Persona Profiles ({personas.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags of Interest</TableHead>
              <TableHead>Review Queue</TableHead>
              <TableHead>Catalog</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personas.map((persona) => (
              <TableRow key={persona.id}>
                <TableCell className="font-medium">{persona.name}</TableCell>
                <TableCell className="max-w-xs truncate">{persona.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {persona.tagsOfInterest.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {persona.tagsOfInterest.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{persona.tagsOfInterest.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{persona.conceptDocReviewQueue.length}</TableCell>
                <TableCell>{persona.conceptDocCatalog.length}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-6 text-red-600"
                    onClick={() => onDeletePersona(persona.id, persona.name)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PersonasTab;
