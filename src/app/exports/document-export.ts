import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Footer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
  Header,
  PageNumberFormat,
  PageOrientation,
  PageNumber,
} from "docx";

declare let $: any;

export class DocumentCreator {
  // tslint:disable-next-line: typedef
  public create(data): Document {
    const doc = new Document({
      creator: data.doc_owner.id,
      title: data.doc_title,
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
              text: "Document created using Vesta Application",
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
          text: data.doc_title,
          heading: HeadingLevel.TITLE,
          spacing: {
            after: 1000,
            line: 10000,
          },
          style: "Doc_heading",
        }),
        this.createHeading(""),
        ...data.sections_list
          .map((section) => {
            const arr: Paragraph[] = [];
            arr.push(this.createSectionHeader(section.sec_title));
            arr.push(this.createSectionContent(section.sec_content));

            return arr;
          })
          .reduce((prev, curr) => prev.concat(curr), []),
      ],
    });

    return doc;
  }

  public createHeading(text: string): Paragraph {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_1,
      spacing: {
        after: 300,
      },
    });
  }
  public createSectionHeader(sec_title: string): Paragraph {
    return new Paragraph({
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: sec_title,
          bold: true,
        }),
      ],
      spacing: {
        after: 10,
      },
    });
  }
  public createSectionContent(content: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: $(content).html(),
          size: 20,
          style: "content_style",
        }),
      ],
    });
  }
}
