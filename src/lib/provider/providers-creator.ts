import { WorkspaceConfiguration } from "vscode";

import { ProviderConfig } from "../config";
import { Provider } from "./provider";
import { ProviderFactory } from "./provider-factory";

export class ProvidersCreator {
    public static create(config: WorkspaceConfiguration): Provider[] {
        const providers: Provider[] = [];
        const providersConfig = config.get<ProviderConfig[]>('providers') || [];
        providersConfig.forEach(providerConfig => {
            try {
                providers.push(ProviderFactory.create(providerConfig));
            } catch (error) {
                console.error(error);
            }
        });
        return providers;
    }
}