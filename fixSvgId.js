const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');
const defineIdCode = `const id = nanoid(5);`
const importCode = `import { nanoid } from 'nanoid'`

const isAstHasDefs = (jsxAst) => {
  let result = false
  if(jsxAst.children && jsxAst.children.length > 0) {
    jsxAst.children.forEach(item => {
      if(item.openingElement.name.name === 'defs') {
        result = true
      }
    })
  }
  return result
}
const propTypesTemplate = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => {
  const needToTransform = isAstHasDefs(jsx)
  let newJsx = jsx
  if(needToTransform) {
    if (global.needTransformSvgCount) {
      global.needTransformSvgCount ++
    } else {
      global.needTransformSvgCount = 1
    }
    console.log(`${componentName} transformed. count:`, global.needTransformSvgCount)
    const { code } = generate(jsx)
    const code1 = code.replace(/\"url\(#(.*?)\)\"/g, '{\`url(#${id}$1)\`}')
    const code2 = code1.replace(/id=\"(.*?)\"/g, 'id={\`${id}$1\`}')
    newJsx = babelParser.parseExpression(code2, {sourceType: 'module',plugins: ['jsx']})
  }

  return tpl`
${imports}
${interfaces}
${importCode}

const ${componentName} = (${props}) => {
  ${needToTransform ? defineIdCode : ''}
  return (${newJsx})
};

${exports}
  `
}

module.exports = propTypesTemplate
