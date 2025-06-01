
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Trash2 } from 'lucide-react';
import { ConceptDoc } from '@/types/persona';
import ConceptDocUpload from '@/components/ConceptDocUpload';

interface ConceptDocsTabProps {
  conceptDocs: ConceptDoc[];
  onDeleteConceptDoc: (docId: string, title: string) => void;
  onDocUploaded: () => void;
}

const ConceptDocsTab = ({ conceptDocs, onDeleteConceptDoc, onDocUploaded }: ConceptDocsTabProps) => {
  return (
    <div className="space-y-6">
      <ConceptDocUpload onDocUploaded={onDocUploaded} />
      
      <Card>
        <CardHeader>
          <CardTitle>All Concept Documents ({conceptDocs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Personas</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conceptDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div>
                      <p className="truncate">{doc.title}</p>
                      {doc.subtitle && (
                        <p className="text-xs text-gray-500 truncate">{doc.subtitle}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{doc.author}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        doc.status === 'published' ? 'bg-green-600' :
                        doc.status === 'curated_review' ? 'bg-yellow-600' :
                        doc.status === 'draft' ? 'bg-gray-600' :
                        'bg-blue-600'
                      }
                    >
                      {doc.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.targetPersonas.length}</TableCell>
                  <TableCell>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6"
                        onClick={() => window.open(doc.htmlUrl, '_blank')}
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 text-red-600"
                        onClick={() => onDeleteConceptDoc(doc.id, doc.title)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConceptDocsTab;
