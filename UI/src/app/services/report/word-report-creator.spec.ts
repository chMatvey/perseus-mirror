import { WordReportCreator } from './word-report-creator';
import { Packer } from 'docx';
import { testMapping } from './image/draw-image-util.spec';

describe('WordReportCreator', () => {
  it('should generate word report', () => {
    const reportCreator = new WordReportCreator();

    const report = reportCreator
      .createHeader1('Source Data Mapping Approach to CDMV6')
      .createFieldsMappingImage({source: 'Source', target: 'CDMV6'}, testMapping)
      .createParagraph()
      .createFieldsDescriptionTable(testMapping)
      .generateReport();

    Packer.toBlob(report).then(blob => {
      // saveAs(blob, 'test-report.docx');
    });
  });
});
