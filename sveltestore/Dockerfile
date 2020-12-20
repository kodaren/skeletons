#docker build . -t kodaren/sveltestore:0.0.1
#docker push kodaren/sveltestore:0.0.1

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-alpine AS base
#FROM mcr.microsoft.com/dotnet/core/runtime:3.1 as base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS build
WORKDIR /src

#COPY *.csproj src/
#WORKDIR /src/api

COPY . .
RUN dotnet build -c Release -o /app

FROM build AS publish
RUN dotnet publish -c Release -o /app --no-restore

# final stage/image
FROM base AS final
WORKDIR /app

COPY --from=publish /app .

RUN ls -alR

ENTRYPOINT ["dotnet", "sveltestore.dll"]
