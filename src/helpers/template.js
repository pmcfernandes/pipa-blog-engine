import * as ejs from 'ejs'
import path from 'node:path'

class TemplateHelper {
  renderTemplate(templatePath, data) {
    const fileName = path.join(process.cwd(), `src/templates/${templatePath}.ejs`);
    return ejs.renderFile(fileName, data, {
      root: path.join(process.cwd(), 'src/templates/')
    });
  }
}

const renderTemplate = new TemplateHelper().renderTemplate;
export { renderTemplate };
