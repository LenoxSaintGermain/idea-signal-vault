
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Calendar, User, FileText } from 'lucide-react';
import { ConceptDoc } from '@/types/persona';
import ConceptDocUpload from '../ConceptDocUpload';

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
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            All Concept Documents ({conceptDocs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conceptDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Concept Documents</h3>
              <p className="text-gray-600">Upload your first concept document using the form above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conceptDocs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{doc.title}</CardTitle>
                        {doc.subtitle && (
                          <p className="text-gray-600 text-sm mb-2">{doc.subtitle}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        className={
                          doc.status === 'published' ? 'bg-green-100 text-green-800' :
                          doc.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {doc.targetPersonas.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Routed to {doc.targetPersonas.length} personas</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(doc.htmlUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {doc.pdfUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.pdfUrl!, '_blank')}
                          >
                            PDF
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteConceptDoc(doc.id, doc.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConceptDocsTab;
