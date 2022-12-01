import { ProviderConfig, ProviderType } from '../config';
import { JenkinsProvider } from './jenkins-provider';
import { Provider } from './provider';

export class ProviderFactory {
    public static create(config: ProviderConfig): Provider {
        const type = config.type;
        switch(type) {
            case ProviderType.jenkins: 
                return new JenkinsProvider(config);
            default: 
                throw new Error(`Not supported type: ${type}`);
        }
    }
}