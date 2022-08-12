/*
 * @Author: Hughie
 * @Date: 2022-08-11 13:50:21
 * @LastEditors: Hughie
 * @LastEditTime: 2022-08-12 16:35:48
 * @Description:
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(
  context: vscode.ExtensionContext
) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const create = (
    args: any,
    templateName: "less" | "scss",
    platform: "web" | "taro"
  ) => {
    let rootPath: string = args.fsPath;

    vscode.window
      .showInputBox({
        validateInput: (value) => {
          if (value.indexOf(" ") > -1) {
            return "Component name cannot include spaces";
          }
        },
        prompt:
          "Please enter component name",
        value: "DefaultComponent",
      })
      .then((componentName) => {
        if (
          typeof componentName ===
          "undefined"
        ) {
          return;
        }

        var componentFolderPath =
          rootPath +
          path.sep +
          componentName;

        if (
          fs.existsSync(
            componentFolderPath
          )
        ) {
          vscode.window.showErrorMessage(
            "Component folder already exists"
          );
          return;
        }

        fs.mkdirSync(
          componentFolderPath
        );
        const componentPath = `${componentFolderPath}${path.sep}index.tsx`;

        const extension =
          vscode.extensions.getExtension(
            "hillmychen.react-ts-component"
          );

        vscode.workspace
          .openTextDocument(
            `${
              extension!.extensionPath
            }/templates/react-ts-${platform}-${templateName}.tmpl`
          )
          .then(
            (
              doc: vscode.TextDocument
            ) => {
              let text = doc.getText();
              text = text.replace(
                /\$componentName/gm,
                componentName
              );
              fs.writeFileSync(
                componentPath,
                text
              );
            }
          );

        const stylePath = `${componentFolderPath}${path.sep}index.module.${templateName}`;
        vscode.workspace
          .openTextDocument(
            `${
              extension!.extensionPath
            }/templates/${templateName}.tmpl`
          )
          .then(
            (
              doc: vscode.TextDocument
            ) => {
              fs.writeFileSync(
                stylePath,
                doc.getText()
              );
            }
          );
        if (platform === "taro") {
          const configPath = `${componentFolderPath}${path.sep}index.config.ts`;
          vscode.workspace
            .openTextDocument(
              `${
                extension!.extensionPath
              }/templates/react-ts-taro-config.tmpl`
            )
            .then(
              (
                doc: vscode.TextDocument
              ) => {
                fs.writeFileSync(
                  configPath,
                  doc.getText()
                );
              }
            );
        }
        vscode.window.showInformationMessage(
          "Component created successfully."
        );
      });
  };

  let lessDisposable =
    vscode.commands.registerCommand(
      "react-ts-component.less",
      (args) => {
        create(args, "less", "web");
      }
    );
  let scssDisposable =
    vscode.commands.registerCommand(
      "react-ts-component.scss",
      (args) => {
        create(args, "scss", "web");
      }
    );
  let taroScssDisposable =
    vscode.commands.registerCommand(
      "react-ts-component.taro-scss",
      (args) => {
        create(args, "scss", "taro");
      }
    );
  let taroLessDisposable =
    vscode.commands.registerCommand(
      "react-ts-component.taro-less",
      (args) => {
        create(args, "less", "taro");
      }
    );
  context.subscriptions.push(
    lessDisposable
  );
  context.subscriptions.push(
    scssDisposable
  );
  context.subscriptions.push(
    taroScssDisposable
  );
  context.subscriptions.push(
    taroLessDisposable
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
