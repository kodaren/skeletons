#docker build . -t kodaren/sveltestore:0.0.1
#docker push kodaren/sveltestore:0.0.1

FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build
WORKDIR /src

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
