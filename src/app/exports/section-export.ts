// Example on how to customise the look at feel using Styles
// Import from 'docx' rather than '../build' if you install from npm

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
  VerticalAlign,
  Footer,
} from "docx";

declare let $: any;

export class SectionCreator {
  public create(data): Document {
    const doc = new Document({
      creator: data.sec_owner.id,
      title: data.sec_title,
      description: "Document/Section created using Vesta",
      styles: {
        paragraphStyles: [
          {
            id: "Doc_heading",
            name: "Doc_heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 50,
              bold: true,
            },
            paragraph: {
              spacing: {
                after: 120,
                line: 400,
              },
            },
          },
          {
            id: "content_style",
            name: "content_style 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 26,
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120,
              },
            },
          },
          {
            id: "footer",
            name: "Footer",
            basedOn: "Normal",
            next: "Normal",
            run: {
              color: "999999",
              italics: true,
            },
            paragraph: {
              indent: {
                left: 720,
              },
              spacing: {
                line: 276,
              },
            },
          },
        ],
      },
    });

    doc.addSection({
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              text: "Section created using Vesta Application",
              style: "footer",
              border: {
                top: {
                  color: "auto",
                  space: 1,
                  value: "single",
                  size: 6,
                },
              },
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          text: data.sec_title,
          heading: HeadingLevel.TITLE,
          spacing: {
            after: 1000,
            line: 10000,
          },
          style: "Doc_heading",
        }),
        new Paragraph({
          text: $(data.sec_content).text(),
          spacing: {
            before: 1000,
            after: 1000,
          },
          style: "content_style",
        }),
      ],
    });

    return doc;
  }
}
